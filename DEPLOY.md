# 🚀 Deployment Guide

## Architecture

**Backend (FastAPI)**: Railway
**Frontend (React)**: Vercel
**Database**: SQLite (in backend container)

---

## 1. Deploy Backend to Railway

### Option A: Railway CLI (Recommended)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project
railway init

# Add environment variables
railway variables set OPENAI_API_KEY=sk-proj-your_key_here
railway variables set OPENAI_MODEL=gpt-4o-mini
railway variables set SENDGRID_API_KEY=SG.your_key_here (optional)

# Deploy
railway up
```

### Option B: Railway Dashboard

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set environment variables in Settings:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `SENDGRID_API_KEY` (optional)
5. Railway will auto-deploy

### Get your API URL

After deployment, Railway will provide a URL like:
```
https://your-app.railway.app
```

Save this URL - you'll need it for the frontend!

---

## 2. Deploy Frontend to Vercel

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Go to frontend directory
cd web

# Login
vercel login

# Set environment variable
vercel env add VITE_API_URL production

# Enter your Railway API URL when prompted:
# https://your-app.railway.app

# Deploy
vercel --prod
```

### Option B: Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-app.railway.app` (your Railway URL)
6. Click "Deploy"

---

## 3. Update CORS (Important!)

After deploying frontend, update your backend CORS settings:

**In `api/main.py`**, change:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    ...
)
```

To:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",  # Your Vercel URL
        "http://localhost:3000"  # Keep for local dev
    ],
    ...
)
```

Commit and push - Railway will auto-redeploy.

---

## 4. Test Your Deployment

1. Visit your Vercel URL
2. Create a test scrape (use 10 pages max for testing)
3. Watch real-time progress
4. Download results

---

## 🎯 Quick Deploy (One-Click)

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/IGTA-Tech/website-scraper)

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/IGTA-Tech/website-scraper&project-name=website-scraper-pro&root-directory=web)

---

## 💰 Cost Estimates

### Railway (Backend)
- **Hobby Plan**: $5/month
- Includes: 512MB RAM, 1GB disk
- Perfect for this application

### Vercel (Frontend)
- **Free Tier**: $0/month
- 100GB bandwidth
- Unlimited deployments

### Total Hosting Cost: ~$5/month

Plus OpenAI API costs (see README for estimates).

---

## 🔧 Environment Variables

### Backend (Railway)

Required:
```
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
```

Optional:
```
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM_EMAIL=scraper@yourapp.com
DEFAULT_MAX_PAGES=500
RATE_LIMIT_DELAY=0.5
CACHE_EXPIRY_DAYS=30
```

### Frontend (Vercel)

Required:
```
VITE_API_URL=https://your-railway-url.railway.app
```

---

## 🐛 Troubleshooting

### "CORS Error" in frontend

- Check CORS settings in `api/main.py`
- Verify `VITE_API_URL` in Vercel environment variables

### "WebSocket connection failed"

- WebSockets work on Railway by default
- Make sure your Railway URL is correct

### "API returning 500 errors"

- Check Railway logs: `railway logs`
- Verify environment variables are set

### Backend running out of memory

- Upgrade Railway plan to 1GB+ RAM
- Reduce `DEFAULT_MAX_PAGES`

---

## 📊 Monitoring

### Railway Dashboard
- View logs
- Monitor resource usage
- Check deployment history

### Vercel Dashboard
- View analytics
- Monitor builds
- Check error logs

---

## 🔄 Updates & Redeployment

Both platforms auto-deploy on git push:

```bash
git add .
git commit -m "Update feature"
git push origin master
```

- **Railway**: Auto-deploys backend
- **Vercel**: Auto-deploys frontend

---

## 🎉 You're Live!

Your app is now running at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-api.railway.app`

Share the frontend URL with users! 🚀
