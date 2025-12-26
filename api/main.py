"""
FastAPI Backend for Website Scraper Pro (Paid Version)
Provides REST API, WebSocket endpoints, Auth, and Stripe integration
"""
import asyncio
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import sys
sys.path.append('..')

from src.scraper import WebScraper
from src.ai_analyzer import AIAnalyzer
from src.data_processor import DataProcessor
from src.email_sender import EmailSender

# Import new routes
from api.routes.stripe_routes import router as stripe_router
from api.routes.auth_routes import router as auth_router, get_current_user_from_token
from api.services.credit_service import credit_service
from api.services.supabase_client import get_user_by_email, create_usage_log, update_credits_used, get_user_credits

# Initialize FastAPI
app = FastAPI(
    title="Website Scraper Pro API",
    description="AI-Powered Web Scraping API with Subscription System",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://webscraper-pro.vercel.app",
        os.getenv("APP_URL", "*")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stripe_router)
app.include_router(auth_router)

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
    url: Optional[str] = None


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
    output_format: str,
    user_id: Optional[str] = None
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
        jobs[job_id]["progress"] = len(results)
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
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/api/scrape", response_model=JobStatus)
async def create_scrape_job_endpoint(
    request: ScrapeRequest,
    background_tasks: BackgroundTasks,
    authorization: str = Header(None)
):
    """
    Create a new scraping job (with optional auth for credit tracking)
    """
    # Validate URL
    if not request.url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Invalid URL")

    user_id = None
    user = None

    # Check if authenticated
    if authorization and authorization.startswith("Bearer "):
        try:
            user = await get_current_user_from_token(authorization)
            user_id = user["id"]

            # Check credits
            credit_check = await credit_service.consume_credits(
                user_id=user_id,
                pages_to_scrape=request.max_pages,
                job_id="pending",
                url=request.url
            )

            if not credit_check["success"]:
                raise HTTPException(
                    status_code=402,
                    detail={
                        "error": "insufficient_credits",
                        "message": credit_check["message"],
                        "credits_remaining": credit_check["credits_remaining"],
                        "upgrade_url": f"{os.getenv('APP_URL', '')}/pricing"
                    }
                )

            # Check feature access for AI
            if request.use_ai:
                has_access = await credit_service.check_feature_access(user_id, "ai_analysis")
                if not has_access:
                    # Disable AI for free tier
                    request.use_ai = False

        except HTTPException:
            raise
        except Exception:
            # If auth fails, allow as anonymous (free tier limits apply)
            pass

    # For anonymous users, limit to free tier
    if not user_id:
        request.max_pages = min(request.max_pages, 10)  # Free tier limit
        request.use_ai = False  # No AI for free tier

    # Create job
    job_id = create_job(request.url, request.max_pages)
    jobs[job_id]["url"] = request.url

    # Start background task
    background_tasks.add_task(
        run_scrape_job,
        job_id,
        request.url,
        request.max_pages,
        request.use_cache,
        request.use_ai,
        request.email,
        request.output_format,
        user_id
    )

    response = jobs[job_id]
    if user_id:
        # Get updated credits
        credits = await get_user_credits(user_id)
        if credits:
            response["credits_remaining"] = credits["credits_total"] - credits["credits_used"]

    return response


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


@app.get("/api/tiers")
async def get_tiers():
    """Get available subscription tiers"""
    return {
        "free": {
            "name": "Free",
            "price": 0,
            "pages_per_month": 10,
            "features": ["Basic metadata extraction", "CSV export", "Community support"],
            "ai_enabled": False
        },
        "starter": {
            "name": "Starter",
            "price": 10,
            "pages_per_month": 500,
            "features": ["Full AI analysis", "Excel + CSV export", "Email support"],
            "ai_enabled": True
        },
        "professional": {
            "name": "Professional",
            "price": 39,
            "pages_per_month": 2500,
            "features": ["Everything in Starter", "API access", "Batch processing", "Priority support"],
            "ai_enabled": True
        },
        "business": {
            "name": "Business",
            "price": 149,
            "pages_per_month": 15000,
            "features": ["Everything in Professional", "White-label reports", "Team (5 users)", "Dedicated support"],
            "ai_enabled": True
        },
        "enterprise": {
            "name": "Enterprise",
            "price": 499,
            "pages_per_month": 50000,
            "features": ["Everything in Business", "Custom integrations", "Unlimited users", "Account manager"],
            "ai_enabled": True
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
