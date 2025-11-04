# 📘 CLAUDE.md - Project Documentation for Claude Code

## 🎯 Project Overview

**Website Scraper Pro** is an AI-powered web intelligence tool that scrapes websites, analyzes content with OpenAI GPT-4o-mini, and generates beautiful reports.

## 🏗️ Architecture

### Core Components

1. **Web Scraper** (`src/scraper.py`)
   - Crawls websites up to specified max pages
   - Extracts metadata: title, description, H1 tags, word count, links
   - Implements rate limiting (0.5s default)
   - Handles errors gracefully
   - Returns structured data

2. **AI Analyzer** (`src/ai_analyzer.py`)
   - Uses OpenAI GPT-4o-mini for content analysis
   - Extracts: summary, topic, keywords, audience, quality score
   - Implements caching to reduce costs
   - Tracks token usage and costs
   - Batch processing support

3. **Cache Manager** (`src/cache.py`)
   - SQLite-based caching system
   - Caches scraped content and AI analysis
   - 30-day default expiry
   - Tracks cache statistics
   - Provides 50%+ cost savings

4. **Data Processor** (`src/data_processor.py`)
   - Exports to Excel with beautiful formatting
   - CSV export option
   - Generates summary statistics
   - Creates visual tables

5. **Email Sender** (`src/email_sender.py`)
   - SendGrid integration
   - Beautiful HTML email templates
   - Attaches Excel reports
   - Optional feature (works without)

6. **CLI Interface** (`main.py`)
   - Interactive mode with prompts
   - Command-line mode for automation
   - Progress bars and live stats
   - Dashboard for cache statistics

## 🔑 Configuration

### Environment Variables (.env)

```env
# Required
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# Optional (for email)
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=scraper@yourapp.com

# Scraper settings
DEFAULT_MAX_PAGES=500
RATE_LIMIT_DELAY=0.5
REQUEST_TIMEOUT=30

# Cache
CACHE_EXPIRY_DAYS=30
CACHE_DB_PATH=cache/scrape_cache.db
```

## 📂 Project Structure

```
website-scraper/
├── src/
│   ├── __init__.py
│   ├── config.py           # Settings management
│   ├── scraper.py          # Web scraping
│   ├── ai_analyzer.py      # AI analysis
│   ├── cache.py            # Caching system
│   ├── data_processor.py   # Data export
│   └── email_sender.py     # Email delivery
├── tests/
│   ├── test_scraper.py
│   ├── test_cache.py
│   └── test_data_processor.py
├── .claude/
│   └── agents/             # Sub-agent definitions
│       ├── scraper.md
│       ├── ai_analyzer.md
│       ├── exporter.md
│       └── emailer.md
├── cache/                  # SQLite database
├── output/                 # Generated reports
├── main.py                 # CLI entry point
├── requirements.txt
├── .env
└── README.md
```

## 🔄 Common Workflows

### 1. Basic Scrape

```bash
python main.py scrape https://example.com
```

**Flow:**
1. Initialize scraper with URL
2. Crawl pages (up to max_pages)
3. Extract metadata from each page
4. Run AI analysis (if enabled)
5. Export to Excel
6. Display summary

### 2. Scrape with Email

```bash
python main.py scrape https://example.com --email user@email.com
```

**Flow:**
1-5. Same as basic scrape
6. Generate summary statistics
7. Send email with Excel attachment
8. Display success message

### 3. View Cache Stats

```bash
python main.py dashboard
```

**Shows:**
- Cached pages count
- Cache hit rate
- API calls saved
- Cost savings
- Token usage

### 4. Clear Cache

```bash
python main.py cache-clear  # Clear all
python main.py cache-clean  # Clear expired only
```

## 🎨 Sub-Agents (Claude Code)

### Scraper Agent
**Purpose:** Optimize web scraping performance

**Typical tasks:**
- Adjust rate limiting
- Handle edge cases
- Improve metadata extraction
- Debug timeout issues

**Invoke with:**
```
@scraper "optimize crawling speed for large sites"
```

### AI Analyzer Agent
**Purpose:** Optimize AI analysis and reduce costs

**Typical tasks:**
- Refine prompts
- Reduce token usage
- Improve accuracy
- Handle edge cases

**Invoke with:**
```
@ai_analyzer "reduce AI cost by 20% without losing quality"
```

### Data Exporter Agent
**Purpose:** Enhance data export and reporting

**Typical tasks:**
- Improve Excel formatting
- Add new export formats
- Generate visualizations
- Data validation

**Invoke with:**
```
@exporter "add charts to Excel report"
```

### Email Sender Agent
**Purpose:** Enhance email delivery

**Typical tasks:**
- Improve email templates
- Add features
- Debug delivery issues
- Handle attachments

**Invoke with:**
```
@emailer "make email template responsive"
```

## 💡 Cost Optimization

### Current Optimization Strategies

1. **Caching** (~53% savings)
   - Cache scraped content (30 days)
   - Cache AI analysis results
   - Check cache before API calls

2. **Content Filtering** (~30% savings)
   - Skip 404/error pages
   - Skip very short pages (<100 words)
   - Skip duplicate content

3. **Batch Processing** (~20% savings)
   - Group similar pages
   - Reduce API overhead

### Pricing

**GPT-4o-mini:**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Typical page:**
- Input: ~800 tokens (prompt + content)
- Output: ~150 tokens (analysis)
- Cost: ~$0.00015 per page

**500 pages with cache:**
- Without cache: ~$0.17
- With cache (50% hit rate): ~$0.08
- **Savings: 53%**

## 🔧 Troubleshooting

### Issue: Scraper Times Out

**Check:**
1. Network connectivity
2. Website response time
3. Rate limit delay

**Fix:**
```python
# In .env, increase timeout
REQUEST_TIMEOUT=60
RATE_LIMIT_DELAY=1.0
```

### Issue: AI Analysis Fails

**Check:**
1. OpenAI API key valid
2. API quota not exceeded
3. Content not too long

**Fix:**
```python
# Check API key
python -c "from src.config import settings; print(settings.openai_api_key[:10])"

# Test API
python -c "from openai import OpenAI; c=OpenAI(); print(c.models.list())"
```

### Issue: Excel Export Fails

**Check:**
1. openpyxl installed
2. Output directory exists
3. Sufficient disk space

**Fix:**
```bash
pip install --upgrade openpyxl pandas
mkdir -p output
```

### Issue: Email Not Sending

**Check:**
1. SendGrid API key configured
2. From email verified
3. Recipient email valid

**Note:** Email is optional feature. App works without it.

## 📊 Performance Benchmarks

### Typical Performance

**Small site (10-50 pages):**
- Scraping: 30-60 seconds
- AI analysis: 30-60 seconds
- Total: 1-2 minutes
- Cost: $0.01-0.02

**Medium site (50-200 pages):**
- Scraping: 2-5 minutes
- AI analysis: 3-6 minutes
- Total: 5-10 minutes
- Cost: $0.03-0.08

**Large site (200-500 pages):**
- Scraping: 5-10 minutes
- AI analysis: 5-15 minutes
- Total: 10-20 minutes
- Cost: $0.08-0.17

## 🧪 Testing

### Run Tests

```bash
# All tests
pytest

# Specific module
pytest tests/test_scraper.py

# With coverage
pytest --cov=src --cov-report=html
```

### Test Coverage Goals

- Core modules: 80%+
- Critical paths: 95%+
- Error handling: 90%+

## 🚀 Deployment Options

### Local Use
Just run `python main.py` - no deployment needed

### Web Service (FastAPI)
```python
# Add to main.py
from fastapi import FastAPI

app = FastAPI()

@app.post("/scrape")
async def api_scrape(url: str):
    scraper = WebScraper(url)
    result = await scraper.scrape()
    return result
```

### Docker
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]
```

### AWS Lambda
```python
# lambda_handler.py
import asyncio
from main import run_scrape

def handler(event, context):
    url = event['url']
    result = asyncio.run(run_scrape(url, max_pages=100))
    return result
```

## 📝 Adding New Features

### Add New Metadata Field

1. Update `src/scraper.py::_extract_metadata()`
2. Add field to data processor column mapping
3. Update Excel/CSV export
4. Add to email template (optional)

### Add New Export Format

1. Create new method in `DataProcessor`
2. Add format option to CLI
3. Update documentation

### Add New AI Analysis Field

1. Update prompt in `src/ai_analyzer.py`
2. Add field to response parsing
3. Update data processor
4. Add to exports

## 🔐 Security Notes

- API keys stored in `.env` (gitignored)
- No credentials in code
- SendGrid API key is optional
- Cache database is local (no cloud storage)
- No user data persistence except cache

## 📈 Future Enhancements

Potential features:
- [ ] JavaScript rendering (Playwright)
- [ ] PDF export
- [ ] Dashboard web UI
- [ ] Multiple AI model support
- [ ] Webhook notifications
- [ ] Scheduled scraping
- [ ] Multi-language support
- [ ] Image analysis
- [ ] API endpoints
- [ ] Docker deployment

---

**This documentation is maintained for Claude Code's context. Update when making significant changes to architecture or workflows.**
