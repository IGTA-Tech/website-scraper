#!/bin/bash
# Deployment Script for Website Scraper Pro
# Run this script from your local machine

set -e

echo "🚀 Website Scraper Pro - Deployment Script"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ $1${NC}"; }

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not found. Installing..."
    npm install -g @railway/cli
    print_success "Railway CLI installed"
else
    print_success "Railway CLI found"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Installing..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI found"
fi

echo ""
echo "📋 Step 1: Deploy Backend to Railway"
echo "======================================"

# Check Railway auth
if ! railway whoami &> /dev/null; then
    print_info "Please authenticate with Railway..."
    railway login
fi

print_success "Authenticated with Railway"

# Check if project exists
if [ ! -f ".railway" ]; then
    print_info "Initializing Railway project..."
    railway init
fi

print_info "Setting up environment variables..."
echo ""
echo "Please enter your API keys:"
read -p "OpenAI API Key (sk-proj-...): " OPENAI_KEY
read -p "SendGrid API Key (optional, press Enter to skip): " SENDGRID_KEY

railway variables set OPENAI_API_KEY="$OPENAI_KEY"
railway variables set OPENAI_MODEL="gpt-4o-mini"

if [ ! -z "$SENDGRID_KEY" ]; then
    railway variables set SENDGRID_API_KEY="$SENDGRID_KEY"
    read -p "SendGrid From Email: " SENDGRID_EMAIL
    railway variables set SENDGRID_FROM_EMAIL="$SENDGRID_EMAIL"
fi

railway variables set DEFAULT_MAX_PAGES="500"
railway variables set RATE_LIMIT_DELAY="0.5"
railway variables set CACHE_EXPIRY_DAYS="30"

print_success "Environment variables configured"

print_info "Deploying to Railway..."
railway up

print_success "Backend deployed to Railway!"

# Get Railway URL
RAILWAY_URL=$(railway domain)
if [ -z "$RAILWAY_URL" ]; then
    print_info "Generating Railway domain..."
    railway domain
    RAILWAY_URL=$(railway domain)
fi

print_success "Backend URL: https://$RAILWAY_URL"
echo ""
echo "🔗 Save this URL: https://$RAILWAY_URL"
echo ""

echo ""
echo "📋 Step 2: Deploy Frontend to Vercel"
echo "====================================="

cd web

# Check Vercel auth
if ! vercel whoami &> /dev/null; then
    print_info "Please authenticate with Vercel..."
    vercel login
fi

print_success "Authenticated with Vercel"

print_info "Setting environment variable..."
vercel env add VITE_API_URL production

echo "Please enter your Railway backend URL:"
echo "https://$RAILWAY_URL"
echo "(Press Enter to use the URL above, or paste a different one)"
read -p "> " USER_URL

if [ -z "$USER_URL" ]; then
    API_URL="https://$RAILWAY_URL"
else
    API_URL="$USER_URL"
fi

echo "$API_URL" | vercel env add VITE_API_URL production

print_info "Deploying to Vercel..."
vercel --prod

VERCEL_URL=$(vercel ls 2>/dev/null | grep "Production" | awk '{print $2}' | head -1)

print_success "Frontend deployed to Vercel!"
echo ""
echo "🔗 Frontend URL: https://$VERCEL_URL"
echo ""

cd ..

echo ""
echo "📋 Step 3: Update CORS Settings"
echo "================================"

print_info "Updating backend CORS to allow your Vercel domain..."

# Update CORS in api/main.py
VERCEL_DOMAIN=$(echo $VERCEL_URL | sed 's/https\?:\/\///')

cat > /tmp/cors_patch.py << 'EOF'
import sys

file_path = "api/main.py"

with open(file_path, "r") as f:
    content = f.read()

# Replace CORS middleware
old_cors = '''app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)'''

new_cors = f'''app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://{sys.argv[1]}",  # Production frontend
        "http://localhost:3000",  # Local development
        "http://localhost:5173",  # Vite dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)'''

content = content.replace(old_cors, new_cors)

with open(file_path, "w") as f:
    f.write(content)

print("✓ CORS updated successfully")
EOF

python3 /tmp/cors_patch.py "$VERCEL_DOMAIN"

print_success "CORS settings updated"

print_info "Committing and pushing changes..."
git add api/main.py
git commit -m "chore: Update CORS for production Vercel domain"
git push origin $(git branch --show-current)

print_info "Redeploying backend with new CORS settings..."
railway up

print_success "Backend redeployed with updated CORS!"

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo ""
echo "🎉 Your application is now live!"
echo ""
echo "📱 Frontend: https://$VERCEL_URL"
echo "🔧 Backend:  https://$RAILWAY_URL"
echo ""
echo "🧪 Test your deployment:"
echo "1. Visit your frontend URL"
echo "2. Create a test scrape (use 10 pages max)"
echo "3. Watch the real-time progress"
echo "4. Download the results"
echo ""
echo "📊 Monitor your deployments:"
echo "- Railway Dashboard: https://railway.app/dashboard"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo ""
print_success "All done! 🚀"
