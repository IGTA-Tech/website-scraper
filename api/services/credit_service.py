"""
Credit Service - Manage user credits and usage tracking
"""
import os
from typing import Optional
from datetime import datetime

from api.services.supabase_client import (
    get_user_credits,
    get_user_subscription,
    update_credits_used,
    create_usage_log
)


class CreditService:
    """
    Manage user credits and usage tracking
    """

    # Feature access matrix by tier
    FEATURE_MATRIX = {
        "free": [],
        "starter": ["ai_analysis", "excel_export"],
        "professional": ["ai_analysis", "excel_export", "api_access", "batch_processing"],
        "business": ["ai_analysis", "excel_export", "api_access", "batch_processing", "white_label", "team_collaboration"],
        "enterprise": ["*"]  # All features
    }

    # Credit limits by tier
    CREDIT_LIMITS = {
        "free": 10,
        "starter": 500,
        "professional": 2500,
        "business": 15000,
        "enterprise": 50000
    }

    async def consume_credits(
        self,
        user_id: str,
        pages_to_scrape: int,
        job_id: str,
        url: str = None
    ) -> dict:
        """
        Consume credits for a scraping job
        Returns: {success: bool, credits_remaining: int, message: str}
        """
        # Get current credits
        credits = await get_user_credits(user_id)

        if not credits:
            return {
                "success": False,
                "credits_remaining": 0,
                "message": "No credits found. Please sign up or subscribe."
            }

        credits_remaining = credits["credits_total"] - credits["credits_used"]

        # Check if enough credits
        if credits_remaining < pages_to_scrape:
            return {
                "success": False,
                "credits_remaining": credits_remaining,
                "message": f"Insufficient credits. Need {pages_to_scrape}, have {credits_remaining}"
            }

        # Consume credits
        new_used = credits["credits_used"] + pages_to_scrape
        await update_credits_used(user_id, new_used)

        # Determine if AI is enabled based on tier
        tier = await self.get_user_tier(user_id)
        ai_enabled = await self.check_feature_access(user_id, "ai_analysis")

        # Log usage
        await create_usage_log(
            user_id=user_id,
            job_id=job_id,
            pages_scraped=pages_to_scrape,
            credits_consumed=pages_to_scrape,
            ai_analysis_enabled=ai_enabled,
            url=url
        )

        return {
            "success": True,
            "credits_remaining": credits_remaining - pages_to_scrape,
            "message": f"Consumed {pages_to_scrape} credits"
        }

    async def get_user_tier(self, user_id: str) -> str:
        """
        Get user's current tier
        """
        subscription = await get_user_subscription(user_id)

        if not subscription or subscription.get("status") != "active":
            return "free"

        return subscription.get("tier", "free")

    async def check_feature_access(
        self,
        user_id: str,
        feature: str
    ) -> bool:
        """
        Check if user has access to a feature

        Features:
        - ai_analysis
        - excel_export
        - api_access
        - batch_processing
        - white_label
        - team_collaboration
        """
        tier = await self.get_user_tier(user_id)

        # Enterprise has access to everything
        if tier == "enterprise":
            return True

        tier_features = self.FEATURE_MATRIX.get(tier, [])
        return feature in tier_features

    async def get_credits_info(self, user_id: str) -> dict:
        """
        Get comprehensive credits information for a user
        """
        credits = await get_user_credits(user_id)
        tier = await self.get_user_tier(user_id)

        if not credits:
            return {
                "tier": "free",
                "credits_total": 10,
                "credits_used": 0,
                "credits_remaining": 10,
                "period_end": None,
                "features": self.FEATURE_MATRIX.get("free", [])
            }

        credits_remaining = credits["credits_total"] - credits["credits_used"]

        return {
            "tier": tier,
            "credits_total": credits["credits_total"],
            "credits_used": credits["credits_used"],
            "credits_remaining": credits_remaining,
            "period_start": credits.get("period_start"),
            "period_end": credits.get("period_end"),
            "features": self.FEATURE_MATRIX.get(tier, [])
        }

    def get_tier_info(self, tier: str) -> dict:
        """
        Get information about a specific tier
        """
        tier_info = {
            "free": {
                "name": "Free",
                "price": 0,
                "credits": 10,
                "features": ["Basic metadata extraction", "CSV export", "Community support"],
                "ai_enabled": False
            },
            "starter": {
                "name": "Starter",
                "price": 10,
                "credits": 500,
                "features": ["Full AI analysis", "Excel + CSV export", "Email support", "Quality & SEO scoring"],
                "ai_enabled": True
            },
            "professional": {
                "name": "Professional",
                "price": 39,
                "credits": 2500,
                "features": ["Everything in Starter", "API access", "Batch processing", "Priority support"],
                "ai_enabled": True
            },
            "business": {
                "name": "Business",
                "price": 149,
                "credits": 15000,
                "features": ["Everything in Professional", "White-label reports", "Team (5 users)", "Dedicated support"],
                "ai_enabled": True
            },
            "enterprise": {
                "name": "Enterprise",
                "price": 499,
                "credits": 50000,
                "features": ["Everything in Business", "Custom integrations", "Unlimited users", "Account manager"],
                "ai_enabled": True
            }
        }

        return tier_info.get(tier, tier_info["free"])


# Singleton instance
credit_service = CreditService()
