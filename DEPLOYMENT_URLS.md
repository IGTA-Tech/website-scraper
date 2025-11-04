# 🔗 Deployment URLs

Track your deployment URLs here after deploying.

## Backend (Railway)

**Status**: ⏳ Not deployed yet

**Deploy Command**:
```bash
railway up
```

**Railway URL**:
```
https://your-app.railway.app
```
(Replace with your actual URL after deployment)

---

## Frontend (Vercel)

**Status**: ⏳ Not deployed yet

**Deploy Command**:
```bash
cd web
vercel --prod
```

**Vercel URL**:
```
https://your-app.vercel.app
```
(Replace with your actual URL after deployment)

---

## Quick Access Links

Once deployed, add these to your bookmarks:

- 🌐 **Live App**: [Your Vercel URL]
- 🔌 **API Docs**: [Your Railway URL]/docs
- 📊 **API Health**: [Your Railway URL]/
- 📦 **GitHub Repo**: https://github.com/IGTA-Tech/website-scraper

---

## Deployment Checklist

### Backend (Railway)
- [ ] Install Railway CLI: `npm install -g @railway/cli`
- [ ] Login: `railway login`
- [ ] Create project: `railway init`
- [ ] Set OpenAI key: `railway variables set OPENAI_API_KEY=...`
- [ ] Deploy: `railway up`
- [ ] Copy Railway URL
- [ ] Test API: Visit `https://your-railway-url.railway.app/`

### Frontend (Vercel)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Go to web dir: `cd web`
- [ ] Install dependencies: `npm install`
- [ ] Login: `vercel login`
- [ ] Set API URL: `vercel env add VITE_API_URL production`
- [ ] Deploy: `vercel --prod`
- [ ] Copy Vercel URL
- [ ] Test app: Visit your Vercel URL

### Post-Deployment
- [ ] Update CORS in `api/main.py` with Vercel URL
- [ ] Commit and push changes
- [ ] Railway auto-redeploys
- [ ] Test full flow: Create scrape job
- [ ] Share app URL with users! 🎉

---

## Environment Variables

### Railway (Backend)
```
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
SENDGRID_API_KEY=SG.your_key (optional)
```

### Vercel (Frontend)
```
VITE_API_URL=https://your-railway-url.railway.app
```

---

## Support

- 📖 Full guide: See [DEPLOY.md](DEPLOY.md)
- 🐛 Issues: https://github.com/IGTA-Tech/website-scraper/issues
- 💬 Questions: Create a GitHub Discussion

---

**Last Updated**: November 4, 2025
**Status**: Ready to deploy 🚀
