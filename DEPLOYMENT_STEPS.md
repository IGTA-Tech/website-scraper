# 🚀 Step-by-Step Deployment Guide

This guide will walk you through deploying **Website Scraper Pro** to Railway (backend) and Vercel (frontend).

## Prerequisites

- Node.js and npm installed on your local machine
- Git repository cloned locally
- OpenAI API key (required)
- SendGrid API key (optional, for email features)

## Option 1: Automated Deployment (Recommended)

Run the automated deployment script:

```bash
./deploy.sh
```

This script will:
1. ✅ Install Railway and Vercel CLIs (if needed)
2. ✅ Authenticate with both services
3. ✅ Deploy backend to Railway
4. ✅ Deploy frontend to Vercel
5. ✅ Update CORS settings automatically
6. ✅ Provide you with live URLs

**That's it!** The script handles everything.

---

## Option 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

### Step 1: Deploy Backend to Railway

#### 1.1 Install Railway CLI

```bash
npm install -g @railway/cli
```

#### 1.2 Login to Railway

```bash
railway login
```

This will open your browser for authentication.

#### 1.3 Initialize Railway Project

```bash
railway init
```

Select "Create new project" and give it a name like `website-scraper-backend`.

#### 1.4 Set Environment Variables

```bash
railway variables set OPENAI_API_KEY="sk-proj-your_key_here"
railway variables set OPENAI_MODEL="gpt-4o-mini"
railway variables set DEFAULT_MAX_PAGES="500"
railway variables set RATE_LIMIT_DELAY="0.5"
railway variables set CACHE_EXPIRY_DAYS="30"
```

Optional (for email features):
```bash
railway variables set SENDGRID_API_KEY="SG.your_key_here"
railway variables set SENDGRID_FROM_EMAIL="scraper@yourapp.com"
```

#### 1.5 Deploy to Railway

```bash
railway up
```

Wait for deployment to complete (usually 2-3 minutes).

#### 1.6 Get Your Railway URL

```bash
railway domain
```

If no domain exists, generate one:
```bash
railway domain
```

**Save this URL!** You'll need it for the frontend.
Example: `https://website-scraper-production.up.railway.app`

---

### Step 2: Deploy Frontend to Vercel

#### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 2.2 Navigate to Frontend Directory

```bash
cd web
```

#### 2.3 Login to Vercel

```bash
vercel login
```

Follow the authentication flow in your browser.

#### 2.4 Set Environment Variable

Add your Railway backend URL:

```bash
vercel env add VITE_API_URL production
```

When prompted, enter your Railway URL:
```
https://your-app.railway.app
```

#### 2.5 Deploy to Vercel

```bash
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Y
- **Link to existing project?** N (unless you have one)
- **Project name:** website-scraper-pro
- **Directory:** ./
- **Override settings?** N

Wait for deployment (usually 1-2 minutes).

**Save your Vercel URL!**
Example: `https://website-scraper-pro.vercel.app`

#### 2.6 Return to Root Directory

```bash
cd ..
```

---

### Step 3: Update CORS Settings

Now that you have your Vercel URL, update the backend to accept requests from it.

#### 3.1 Edit `api/main.py`

Find this section (around line 30):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Replace it with:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",  # Replace with YOUR Vercel URL
        "http://localhost:3000",         # Keep for local dev
        "http://localhost:5173",         # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Important:** Replace `https://your-app.vercel.app` with your actual Vercel URL!

#### 3.2 Commit and Push Changes

```bash
git add api/main.py
git commit -m "chore: Configure CORS for production"
git push origin claude/check-deployment-status-011CUoHtJEVyFA4pNAWz9J9L
```

#### 3.3 Redeploy Backend

Railway will auto-deploy when you push, or manually trigger:

```bash
railway up
```

---

### Step 4: Test Your Deployment

#### 4.1 Visit Your Frontend

Open your Vercel URL in a browser:
```
https://your-app.vercel.app
```

#### 4.2 Create a Test Scrape

1. Enter a URL (e.g., `https://example.com`)
2. Set max pages to `10` (for testing)
3. Click "Start Scraping"
4. Watch real-time progress via WebSocket updates
5. Download the results when complete

#### 4.3 Verify Backend

Check your backend is responding:
```bash
curl https://your-railway-url.railway.app/
```

Should return:
```json
{
  "name": "Website Scraper Pro API",
  "version": "1.0.0",
  "status": "running"
}
```

---

## Monitoring & Logs

### Railway Dashboard

View backend logs and metrics:
```bash
railway logs
```

Or visit: https://railway.app/dashboard

### Vercel Dashboard

View frontend builds and analytics:
https://vercel.com/dashboard

---

## Troubleshooting

### CORS Error in Browser Console

**Problem:** Frontend can't connect to backend

**Solution:**
1. Verify `VITE_API_URL` in Vercel environment variables
2. Check CORS settings in `api/main.py` include your Vercel domain
3. Redeploy backend after CORS changes

### WebSocket Connection Failed

**Problem:** Real-time updates not working

**Solution:**
1. Ensure Railway URL uses `https://` (not `http://`)
2. Check Railway logs for WebSocket errors: `railway logs`
3. Verify frontend is using correct Railway URL

### Backend 500 Errors

**Problem:** API returning internal server errors

**Solution:**
1. Check Railway logs: `railway logs`
2. Verify environment variables are set: `railway variables`
3. Ensure OpenAI API key is valid

### Frontend Build Failed

**Problem:** Vercel build errors

**Solution:**
1. Check `VITE_API_URL` is set correctly
2. Verify `web/package.json` dependencies are correct
3. Check Vercel build logs in dashboard

---

## Cost Estimates

### Infrastructure Costs

- **Railway (Backend):** ~$5/month (Hobby plan)
- **Vercel (Frontend):** $0/month (Free tier, 100GB bandwidth)

**Total Hosting:** ~$5/month

### API Costs

- **OpenAI GPT-4o-mini:**
  - Input: $0.15 per 1M tokens
  - Output: $0.60 per 1M tokens
  - ~$0.00015 per page analyzed
  - 500 pages ≈ $0.08 (with caching)

- **SendGrid (Optional):**
  - Free tier: 100 emails/day
  - Pro: $15/month for 40,000 emails

---

## Updating Your Deployment

Both platforms auto-deploy when you push to your repository:

```bash
git add .
git commit -m "Your changes"
git push origin claude/check-deployment-status-011CUoHtJEVyFA4pNAWz9J9L
```

- **Railway:** Auto-deploys backend (2-3 minutes)
- **Vercel:** Auto-deploys frontend (1-2 minutes)

---

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ Yes | - | Your OpenAI API key |
| `OPENAI_MODEL` | ✅ Yes | `gpt-4o-mini` | Model to use |
| `SENDGRID_API_KEY` | ⚪ Optional | - | For email features |
| `SENDGRID_FROM_EMAIL` | ⚪ Optional | - | Sender email address |
| `DEFAULT_MAX_PAGES` | ⚪ Optional | `500` | Max pages to scrape |
| `RATE_LIMIT_DELAY` | ⚪ Optional | `0.5` | Delay between requests |
| `CACHE_EXPIRY_DAYS` | ⚪ Optional | `30` | Cache expiration |

### Frontend (Vercel)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ Yes | - | Railway backend URL |

---

## Security Notes

- ✅ API keys stored as environment variables (not in code)
- ✅ CORS configured for specific domains only
- ✅ HTTPS enforced on both platforms
- ✅ No credentials in git repository
- ✅ SQLite database is container-local (ephemeral)

---

## Getting Help

### Railway Support
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway

### Vercel Support
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

### Project Issues
- GitHub: https://github.com/IGTA-Tech/website-scraper/issues

---

## 🎉 You're Done!

Your Website Scraper Pro is now live and ready to use!

**Share your frontend URL with users:** `https://your-app.vercel.app`

Enjoy! 🚀
