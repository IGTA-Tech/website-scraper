# Website Scraper Pro - Paid Version Branch

## Overview
This is the `paid-version` branch containing the SaaS implementation with Stripe payments, user authentication, and credit-based pricing.

## Current Status: DEPLOYED
- **Frontend:** https://web-iota-kohl.vercel.app
- **Backend API:** https://api-production-c492.up.railway.app
- **GitHub Branch:** `paid-version`

## Tech Stack
- **Frontend:** React + Vite + TailwindCSS (Vercel)
- **Backend:** FastAPI + Python (Railway)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **Email:** SendGrid

## Environment Variables Required

### Backend (Railway)
```
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini
SUPABASE_URL=https://hqtmcyuxiajbkaocypuq.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_STARTER=price_1SiTD4BsxM9WuBhjc9votvnW
STRIPE_PRICE_PROFESSIONAL=price_1SiTD5BsxM9WuBhjfspyI3jQ
STRIPE_PRICE_BUSINESS=price_1SiTD5BsxM9WuBhjmFFSMy6Q
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=applications@innovativeautomations.dev
APP_URL=https://web-iota-kohl.vercel.app
PORT=8000
```

### Frontend (Vercel)
```
VITE_API_URL=https://api-production-c492.up.railway.app
VITE_WS_URL=wss://api-production-c492.up.railway.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## Pricing Tiers

| Tier | Price | Pages/mo | Features |
|------|-------|----------|----------|
| Free | $0 | 10 | Basic metadata, CSV export |
| Starter | $10 | 500 | AI analysis, Excel export |
| Professional | $39 | 2,500 | API access, batch processing |
| Business | $149 | 15,000 | White-label, team (5 users) |
| Enterprise | $499+ | Custom | Everything custom |

## Database Tables (Supabase)
- `users` - User accounts
- `subscriptions` - Stripe subscriptions
- `user_credits` - Credit balances
- `usage_logs` - Usage tracking
- `payments` - Payment history
- `blog_posts` - Blog content (Coming Soon)
- `blog_categories` - Blog categories
- `post_categories` - Post-category mapping

## Pages Created

| Page | Route | Description |
|------|-------|-------------|
| LandingPage | `/` | Hero, features, pricing preview |
| ScraperTool | `/scrape` | Main scraping tool |
| ResultsPage | `/results/:jobId` | Job progress & download |
| PricingPage | `/pricing` | All 5 tiers with Stripe checkout |
| LoginPage | `/login` | User authentication |
| SignupPage | `/signup` | User registration |
| DashboardPage | `/dashboard` | Credits, subscription, history |
| SupportPage | `/support` | FAQ section |
| BlogPage | `/blog` | Coming Soon placeholder |
| PrivacyPage | `/privacy` | Privacy policy |
| TermsPage | `/terms` | Terms of service |

## What Needs to Be Done

### Critical
1. **Stripe Webhook Configuration**
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://api-production-c492.up.railway.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy webhook secret to Railway env vars as `STRIPE_WEBHOOK_SECRET`

2. **Test Payment Flow**
   - Test signup → checkout → subscription activation
   - Verify credits are added after payment

### Improvements
1. Add password reset flow
2. Add email verification
3. Add more robust error handling
4. Add loading states and better UX feedback
5. Implement blog content management
6. Add Google/GitHub OAuth

### API Endpoints to Verify
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/stripe/create-checkout-session` - Start Stripe checkout
- `POST /api/stripe/webhook` - Handle Stripe events
- `POST /api/scrape` - Start scraping job
- `GET /api/jobs/{job_id}` - Get job status

## Local Development

```bash
# Clone and checkout branch
git clone https://github.com/IGTA-Tech/website-scraper.git
cd website-scraper
git checkout paid-version

# Backend
cd api
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd web
npm install
npm run dev
```

## Deployment

### Vercel (Frontend)
- Auto-deploys from `paid-version` branch
- Configure env vars in Vercel dashboard

### Railway (Backend)
- Auto-deploys from `paid-version` branch
- Uses Dockerfile in root
- Configure env vars in Railway dashboard

## Files Modified/Created

### Backend
- `api/routes/auth_routes.py` - Authentication endpoints
- `api/routes/stripe_routes.py` - Stripe payment endpoints
- `api/services/credit_service.py` - Credit management
- `api/services/supabase_client.py` - Database operations
- `api/main.py` - Updated with new routes

### Frontend
- `web/src/pages/*.jsx` - All 11 pages
- `web/src/App.jsx` - Updated routes
- `web/src/services/api.js` - API client with auth

### Infrastructure
- `Dockerfile` - Container configuration
- `migrations/001_initial_schema.sql` - Database schema
- `scripts/setup_stripe.js` - Stripe product setup

## Contact
For questions about this implementation, contact the development team.
