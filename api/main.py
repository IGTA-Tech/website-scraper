"""
FastAPI Backend for Website Scraper Pro
Provides REST API and WebSocket endpoints
"""
import asyncio
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import sys
sys.path.append('..')

from src.scraper import WebScraper
from src.ai_analyzer import AIAnalyzer
from src.data_processor import DataProcessor
from src.email_sender import EmailSender

# Initialize FastAPI
app = FastAPI(
    title="Website Scraper Pro API",
    description="AI-Powered Web Scraping API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job storage (use Redis in production)
jobs: Dict[str, Dict] = {}
active_websockets: Dict[str, WebSocket] = {}


# Pydantic models
class ScrapeRequest(BaseModel):
    url: str
    max_pages: int = 500
    use_cache: bool = True
    use_ai: bool = True
    email: Optional[str] = None
    output_format: str = "xlsx"


class JobStatus(BaseModel):
    job_id: str
    status: str
    progress: int
    total: int
    message: str
    created_at: str
    completed_at: Optional[str] = None
    result_file: Optional[str] = None
    stats: Optional[Dict] = None


# Helper functions
def create_job(url: str, max_pages: int) -> str:
    """Create a new scraping job"""
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "job_id": job_id,
        "url": url,
        "max_pages": max_pages,
        "status": "queued",
        "progress": 0,
        "total": max_pages,
        "message": "Job queued",
        "created_at": datetime.now().isoformat(),
        "completed_at": None,
        "result_file": None,
        "stats": None,
    }
    return job_id


async def send_progress_update(job_id: str):
    """Send progress update via WebSocket"""
    if job_id in active_websockets:
        try:
            await active_websockets[job_id].send_json(jobs[job_id])
        except Exception:
            pass


async def run_scrape_job(
    job_id: str,
    url: str,
    max_pages: int,
    use_cache: bool,
    use_ai: bool,
    email: Optional[str],
    output_format: str
):
    """Run scraping job in background"""
    try:
        # Update status
        jobs[job_id]["status"] = "scraping"
        jobs[job_id]["message"] = "Starting web scrape..."
        await send_progress_update(job_id)

        # Step 1: Scrape
        scraper = WebScraper(url, max_pages)

        # Monkey-patch to send progress updates
        original_scrape = scraper.scrape
        async def scrape_with_progress():
            result = await original_scrape()
            jobs[job_id]["progress"] = len(result["results"])
            jobs[job_id]["message"] = f"Scraped {len(result['results'])} pages"
            await send_progress_update(job_id)
            return result

        scraper.scrape = scrape_with_progress
        scrape_result = await scraper.scrape()

        results = scrape_result["results"]
        stats = scrape_result["stats"]

        if not results:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["message"] = "No pages scraped"
            await send_progress_update(job_id)
            return

        # Step 2: AI Analysis
        if use_ai:
            jobs[job_id]["status"] = "analyzing"
            jobs[job_id]["message"] = "Running AI analysis..."
            await send_progress_update(job_id)

            analyzer = AIAnalyzer()
            results = analyzer.analyze_batch(results, use_cache=use_cache, show_progress=False)

            ai_stats = analyzer.get_usage_stats()
            stats["total_tokens"] = ai_stats["total_tokens"]
            stats["total_cost"] = ai_stats["total_cost"]
        else:
            stats["total_cost"] = 0.0

        # Step 3: Export
        jobs[job_id]["status"] = "exporting"
        jobs[job_id]["message"] = "Generating report..."
        await send_progress_update(job_id)

        processor = DataProcessor()

        if output_format in ["xlsx", "both"]:
            output_file = processor.export_to_excel(results)
        else:
            output_file = processor.export_to_csv(results)

        # Step 4: Email (optional)
        if email:
            jobs[job_id]["message"] = "Sending email..."
            await send_progress_update(job_id)

            sender = EmailSender()
            summary = processor.generate_summary(results, stats)
            sender.send_results(email, summary, url, output_file)

        # Complete
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["progress"] = max_pages
        jobs[job_id]["message"] = "Scrape complete!"
        jobs[job_id]["completed_at"] = datetime.now().isoformat()
        jobs[job_id]["result_file"] = str(output_file.name)
        jobs[job_id]["stats"] = stats
        await send_progress_update(job_id)

    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["message"] = f"Error: {str(e)}"
        await send_progress_update(job_id)


# API Endpoints
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "name": "Website Scraper Pro API",
        "version": "1.0.0",
        "status": "running"
    }


@app.post("/api/scrape", response_model=JobStatus)
async def create_scrape_job(request: ScrapeRequest, background_tasks: BackgroundTasks):
    """
    Create a new scraping job

    Returns job ID for tracking progress
    """
    # Validate URL
    if not request.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid URL")

    # Create job
    job_id = create_job(request.url, request.max_pages)

    # Start background task
    background_tasks.add_task(
        run_scrape_job,
        job_id,
        request.url,
        request.max_pages,
        request.use_cache,
        request.use_ai,
        request.email,
        request.output_format
    )

    return jobs[job_id]


@app.get("/api/jobs/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: str):
    """Get status of a specific job"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    return jobs[job_id]


@app.get("/api/jobs", response_model=List[JobStatus])
async def list_jobs():
    """List all jobs"""
    return list(jobs.values())


@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """Download result file"""
    file_path = Path("output") / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@app.delete("/api/jobs/{job_id}")
async def delete_job(job_id: str):
    """Delete a job"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")

    # Delete result file if exists
    if jobs[job_id]["result_file"]:
        file_path = Path("output") / jobs[job_id]["result_file"]
        if file_path.exists():
            file_path.unlink()

    del jobs[job_id]
    return {"message": "Job deleted"}


@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """
    WebSocket endpoint for real-time job progress updates
    """
    await websocket.accept()
    active_websockets[job_id] = websocket

    try:
        # Send initial status
        if job_id in jobs:
            await websocket.send_json(jobs[job_id])

        # Keep connection alive
        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        if job_id in active_websockets:
            del active_websockets[job_id]


@app.get("/api/stats")
async def get_stats():
    """Get cache and usage statistics"""
    from src.cache import cache_manager

    cache_stats = cache_manager.get_stats(days=30)

    return {
        "cache": cache_stats,
        "jobs": {
            "total": len(jobs),
            "queued": len([j for j in jobs.values() if j["status"] == "queued"]),
            "running": len([j for j in jobs.values() if j["status"] in ["scraping", "analyzing", "exporting"]]),
            "completed": len([j for j in jobs.values() if j["status"] == "completed"]),
            "failed": len([j for j in jobs.values() if j["status"] == "failed"]),
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
