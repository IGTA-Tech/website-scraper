"""
Supabase client for database operations
"""
import os
from supabase import create_client, Client
from typing import Optional
from datetime import datetime, timedelta

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://hqtmcyuxiajbkaocypuq.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# ==================
# USER OPERATIONS
# ==================

async def get_user(user_id: str) -> Optional[dict]:
    """Get user by ID"""
    result = supabase.table("users").select("*").eq("id", user_id).single().execute()
    return result.data if result.data else None


async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user by email"""
    result = supabase.table("users").select("*").eq("email", email).single().execute()
    return result.data if result.data else None


async def create_user(email: str) -> dict:
    """Create new user"""
    result = supabase.table("users").insert({"email": email}).execute()
    return result.data[0] if result.data else None


async def update_user_stripe_customer(user_id: str, stripe_customer_id: str) -> dict:
    """Update user's Stripe customer ID"""
    result = supabase.table("users").update({
        "stripe_customer_id": stripe_customer_id
    }).eq("id", user_id).execute()
    return result.data[0] if result.data else None


# ==================
# SUBSCRIPTION OPERATIONS
# ==================

async def get_user_subscription(user_id: str) -> Optional[dict]:
    """Get user's active subscription"""
    result = supabase.table("subscriptions").select("*").eq("user_id", user_id).eq("status", "active").single().execute()
    return result.data if result.data else None


async def get_subscription_by_stripe_id(stripe_subscription_id: str) -> Optional[dict]:
    """Get subscription by Stripe subscription ID"""
    result = supabase.table("subscriptions").select("*").eq("stripe_subscription_id", stripe_subscription_id).single().execute()
    return result.data if result.data else None


async def create_subscription_record(
    user_id: str,
    stripe_subscription_id: str,
    stripe_price_id: str,
    tier: str,
    status: str,
    current_period_start: datetime,
    current_period_end: datetime
) -> dict:
    """Create new subscription record"""
    result = supabase.table("subscriptions").insert({
        "user_id": user_id,
        "stripe_subscription_id": stripe_subscription_id,
        "stripe_price_id": stripe_price_id,
        "tier": tier,
        "status": status,
        "current_period_start": current_period_start.isoformat(),
        "current_period_end": current_period_end.isoformat()
    }).execute()
    return result.data[0] if result.data else None


async def update_subscription_record(
    stripe_subscription_id: str,
    status: str,
    current_period_end: datetime,
    cancel_at_period_end: bool = False
) -> dict:
    """Update subscription record"""
    result = supabase.table("subscriptions").update({
        "status": status,
        "current_period_end": current_period_end.isoformat(),
        "cancel_at_period_end": cancel_at_period_end
    }).eq("stripe_subscription_id", stripe_subscription_id).execute()
    return result.data[0] if result.data else None


async def update_subscription_status(stripe_subscription_id: str, status: str) -> dict:
    """Update subscription status"""
    result = supabase.table("subscriptions").update({
        "status": status
    }).eq("stripe_subscription_id", stripe_subscription_id).execute()
    return result.data[0] if result.data else None


async def get_user_id_from_subscription(stripe_subscription_id: str) -> Optional[str]:
    """Get user ID from subscription"""
    subscription = await get_subscription_by_stripe_id(stripe_subscription_id)
    return subscription["user_id"] if subscription else None


# ==================
# CREDITS OPERATIONS
# ==================

async def get_user_credits(user_id: str) -> Optional[dict]:
    """Get user's current credits"""
    now = datetime.now()
    result = supabase.table("user_credits").select("*").eq("user_id", user_id).lte("period_start", now.isoformat()).gte("period_end", now.isoformat()).order("created_at", desc=True).limit(1).execute()

    if result.data:
        return result.data[0]

    # No credits found, create free tier credits
    return await allocate_user_credits(user_id, 10, now, now + timedelta(days=30))


async def allocate_user_credits(
    user_id: str,
    credits_total: int,
    period_start: datetime,
    period_end: datetime,
    subscription_id: str = None
) -> dict:
    """Allocate credits for a user"""
    result = supabase.table("user_credits").insert({
        "user_id": user_id,
        "subscription_id": subscription_id,
        "credits_total": credits_total,
        "credits_used": 0,
        "period_start": period_start.isoformat(),
        "period_end": period_end.isoformat()
    }).execute()
    return result.data[0] if result.data else None


async def update_credits_used(user_id: str, new_used: int) -> dict:
    """Update credits used count"""
    credits = await get_user_credits(user_id)
    if credits:
        result = supabase.table("user_credits").update({
            "credits_used": new_used
        }).eq("id", credits["id"]).execute()
        return result.data[0] if result.data else None
    return None


async def renew_user_credits(user_id: str, period_start: datetime, period_end: datetime) -> dict:
    """Renew user credits for new billing period"""
    subscription = await get_user_subscription(user_id)
    tier = subscription["tier"] if subscription else "free"

    credits_map = {
        "free": 10,
        "starter": 500,
        "professional": 2500,
        "business": 15000,
        "enterprise": 50000  # Default for enterprise
    }

    credits_total = credits_map.get(tier, 10)
    return await allocate_user_credits(user_id, credits_total, period_start, period_end, subscription["id"] if subscription else None)


# ==================
# USAGE OPERATIONS
# ==================

async def create_usage_log(
    user_id: str,
    job_id: str,
    pages_scraped: int,
    credits_consumed: int,
    ai_analysis_enabled: bool = False,
    cost_incurred: float = None,
    url: str = None
) -> dict:
    """Create usage log entry"""
    result = supabase.table("usage_logs").insert({
        "user_id": user_id,
        "job_id": job_id,
        "pages_scraped": pages_scraped,
        "credits_consumed": credits_consumed,
        "ai_analysis_enabled": ai_analysis_enabled,
        "cost_incurred": cost_incurred,
        "url": url
    }).execute()
    return result.data[0] if result.data else None


async def update_usage_log_job_id(old_job_id: str, new_job_id: str, user_id: str) -> dict:
    """Update usage log with actual job ID"""
    result = supabase.table("usage_logs").update({
        "job_id": new_job_id
    }).eq("job_id", old_job_id).eq("user_id", user_id).execute()
    return result.data[0] if result.data else None


async def get_user_usage_history(user_id: str, limit: int = 50) -> list:
    """Get user's usage history"""
    result = supabase.table("usage_logs").select("*").eq("user_id", user_id).order("timestamp", desc=True).limit(limit).execute()
    return result.data if result.data else []


# ==================
# PAYMENT OPERATIONS
# ==================

async def create_payment_record(
    user_id: str,
    stripe_payment_intent_id: str = None,
    amount: float = 0,
    status: str = "pending",
    description: str = None
) -> dict:
    """Create payment record"""
    result = supabase.table("payments").insert({
        "user_id": user_id,
        "stripe_payment_intent_id": stripe_payment_intent_id,
        "amount": amount,
        "status": status,
        "description": description
    }).execute()
    return result.data[0] if result.data else None


async def get_user_payments(user_id: str, limit: int = 20) -> list:
    """Get user's payment history"""
    result = supabase.table("payments").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
    return result.data if result.data else []


# ==================
# BLOG OPERATIONS
# ==================

async def get_published_posts(limit: int = 20, offset: int = 0) -> list:
    """Get published blog posts"""
    result = supabase.table("blog_posts").select("*").eq("status", "published").order("published_at", desc=True).range(offset, offset + limit - 1).execute()
    return result.data if result.data else []


async def get_post_by_slug(slug: str) -> Optional[dict]:
    """Get blog post by slug"""
    result = supabase.table("blog_posts").select("*").eq("slug", slug).eq("status", "published").single().execute()
    return result.data if result.data else None


async def get_blog_categories() -> list:
    """Get all blog categories"""
    result = supabase.table("blog_categories").select("*").order("name").execute()
    return result.data if result.data else []


# ==================
# TIER HELPERS
# ==================

async def downgrade_to_free_tier(user_id: str) -> dict:
    """Downgrade user to free tier"""
    now = datetime.now()
    # Cancel any active subscription in DB
    supabase.table("subscriptions").update({
        "status": "canceled"
    }).eq("user_id", user_id).eq("status", "active").execute()

    # Allocate free tier credits
    return await allocate_user_credits(user_id, 10, now, now + timedelta(days=30))
