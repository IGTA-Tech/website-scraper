"""
Stripe Routes - Handle subscriptions, payments, and webhooks
"""
import os
import stripe
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from api.services.supabase_client import (
    get_user,
    update_user_stripe_customer,
    get_user_subscription,
    get_user_credits,
    create_subscription_record,
    update_subscription_record,
    update_subscription_status,
    get_subscription_by_stripe_id,
    get_user_id_from_subscription,
    allocate_user_credits,
    renew_user_credits,
    create_payment_record,
    downgrade_to_free_tier
)

router = APIRouter(prefix="/api/stripe", tags=["stripe"])

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")

# Price IDs (set via environment)
PRICE_MAP = {
    os.getenv("STRIPE_PRICE_STARTER", ""): ("starter", 500),
    os.getenv("STRIPE_PRICE_PROFESSIONAL", ""): ("professional", 2500),
    os.getenv("STRIPE_PRICE_BUSINESS", ""): ("business", 15000),
}


class CheckoutRequest(BaseModel):
    price_id: str
    user_id: str
    success_url: str
    cancel_url: str


class PortalRequest(BaseModel):
    user_id: str
    return_url: str


# -----------------
# SUBSCRIPTION MANAGEMENT
# -----------------

@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutRequest):
    """
    Create Stripe checkout session for new subscription
    """
    try:
        # Get or create Stripe customer
        user = await get_user(request.user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not user.get("stripe_customer_id"):
            customer = stripe.Customer.create(
                email=user["email"],
                metadata={"user_id": request.user_id}
            )
            await update_user_stripe_customer(request.user_id, customer.id)
            customer_id = customer.id
        else:
            customer_id = user["stripe_customer_id"]

        # Create checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{
                "price": request.price_id,
                "quantity": 1
            }],
            mode="subscription",
            success_url=f"{request.success_url}?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=request.cancel_url,
            metadata={
                "user_id": request.user_id
            }
        )

        return {"sessionId": session.id, "url": session.url}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/create-portal-session")
async def create_portal_session(request: PortalRequest):
    """
    Create Stripe customer portal session for managing subscription
    """
    try:
        user = await get_user(request.user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not user.get("stripe_customer_id"):
            raise HTTPException(status_code=400, detail="No subscription found")

        session = stripe.billing_portal.Session.create(
            customer=user["stripe_customer_id"],
            return_url=request.return_url
        )

        return {"url": session.url}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/subscription/{user_id}")
async def get_subscription_status(user_id: str):
    """
    Get current subscription status and credits
    """
    try:
        subscription = await get_user_subscription(user_id)
        credits = await get_user_credits(user_id)

        if not credits:
            credits = {
                "credits_total": 10,
                "credits_used": 0,
                "period_end": None
            }

        credits_remaining = credits["credits_total"] - credits["credits_used"]

        return {
            "subscription": {
                "tier": subscription["tier"] if subscription else "free",
                "status": subscription["status"] if subscription else "active",
                "current_period_end": subscription["current_period_end"] if subscription else None,
                "cancel_at_period_end": subscription.get("cancel_at_period_end", False) if subscription else False
            },
            "credits": {
                "total": credits["credits_total"],
                "used": credits["credits_used"],
                "remaining": credits_remaining,
                "resets_at": credits.get("period_end")
            }
        }

    except Exception as e:
        raise HTTPException(status_code=404, detail="Subscription not found")


@router.get("/prices")
async def get_prices():
    """
    Get available subscription prices
    """
    app_url = os.getenv("APP_URL", "")

    prices = {
        "starter": {
            "price_id": os.getenv("STRIPE_PRICE_STARTER", ""),
            "name": "Starter",
            "price": 10,
            "credits": 500,
            "features": [
                "Full AI analysis (GPT-4o-mini)",
                "Quality & SEO scoring",
                "Excel + CSV export",
                "Email support"
            ]
        },
        "professional": {
            "price_id": os.getenv("STRIPE_PRICE_PROFESSIONAL", ""),
            "name": "Professional",
            "price": 39,
            "credits": 2500,
            "features": [
                "Everything in Starter",
                "API access",
                "Batch processing",
                "Priority support"
            ]
        },
        "business": {
            "price_id": os.getenv("STRIPE_PRICE_BUSINESS", ""),
            "name": "Business",
            "price": 149,
            "credits": 15000,
            "features": [
                "Everything in Professional",
                "White-label reports",
                "Team collaboration (5 users)",
                "Dedicated support"
            ]
        }
    }

    return prices


# -----------------
# WEBHOOK HANDLING
# -----------------

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle different event types
    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        await handle_checkout_completed(data)

    elif event_type == "customer.subscription.updated":
        await handle_subscription_updated(data)

    elif event_type == "customer.subscription.deleted":
        await handle_subscription_deleted(data)

    elif event_type == "invoice.payment_succeeded":
        await handle_payment_succeeded(data)

    elif event_type == "invoice.payment_failed":
        await handle_payment_failed(data)

    return {"status": "success"}


# -----------------
# WEBHOOK HANDLERS
# -----------------

async def handle_checkout_completed(session):
    """
    New subscription created
    """
    user_id = session["metadata"]["user_id"]
    subscription_id = session["subscription"]

    # Get subscription details from Stripe
    subscription = stripe.Subscription.retrieve(subscription_id)

    # Determine tier from price_id
    price_id = subscription["items"]["data"][0]["price"]["id"]
    tier, credits = get_tier_from_price_id(price_id)

    # Create subscription record
    await create_subscription_record(
        user_id=user_id,
        stripe_subscription_id=subscription_id,
        stripe_price_id=price_id,
        tier=tier,
        status=subscription["status"],
        current_period_start=datetime.fromtimestamp(subscription["current_period_start"]),
        current_period_end=datetime.fromtimestamp(subscription["current_period_end"])
    )

    # Allocate credits
    await allocate_user_credits(
        user_id=user_id,
        credits_total=credits,
        period_start=datetime.fromtimestamp(subscription["current_period_start"]),
        period_end=datetime.fromtimestamp(subscription["current_period_end"])
    )


async def handle_subscription_updated(subscription):
    """
    Subscription changed (upgrade/downgrade)
    """
    await update_subscription_record(
        stripe_subscription_id=subscription["id"],
        status=subscription["status"],
        current_period_end=datetime.fromtimestamp(subscription["current_period_end"]),
        cancel_at_period_end=subscription.get("cancel_at_period_end", False)
    )


async def handle_subscription_deleted(subscription):
    """
    Subscription canceled
    """
    await update_subscription_status(
        stripe_subscription_id=subscription["id"],
        status="canceled"
    )

    # Move user back to free tier
    user_id = await get_user_id_from_subscription(subscription["id"])
    if user_id:
        await downgrade_to_free_tier(user_id)


async def handle_payment_succeeded(invoice):
    """
    Monthly payment succeeded - renew credits
    """
    subscription_id = invoice.get("subscription")

    if subscription_id:
        subscription = await get_subscription_by_stripe_id(subscription_id)

        if subscription:
            # Renew credits for new period
            await renew_user_credits(
                user_id=subscription["user_id"],
                period_start=datetime.fromtimestamp(invoice["period_start"]),
                period_end=datetime.fromtimestamp(invoice["period_end"])
            )

            # Log payment
            await create_payment_record(
                user_id=subscription["user_id"],
                stripe_payment_intent_id=invoice.get("payment_intent"),
                amount=invoice["amount_paid"] / 100,
                status="succeeded"
            )


async def handle_payment_failed(invoice):
    """
    Payment failed - notify user
    """
    subscription_id = invoice.get("subscription")

    if subscription_id:
        subscription = await get_subscription_by_stripe_id(subscription_id)

        if subscription:
            # Log failed payment
            await create_payment_record(
                user_id=subscription["user_id"],
                amount=invoice["amount_due"] / 100,
                status="failed"
            )


# -----------------
# HELPER FUNCTIONS
# -----------------

def get_tier_from_price_id(price_id: str) -> tuple:
    """
    Map Stripe price ID to tier and credits
    """
    return PRICE_MAP.get(price_id, ("free", 10))
