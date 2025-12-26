"""
Auth Routes - Handle user authentication via Supabase Auth
"""
import os
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from supabase import create_client

from api.services.supabase_client import (
    get_user,
    get_user_by_email,
    create_user,
    get_user_credits,
    get_user_subscription
)
from api.services.credit_service import credit_service

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Initialize Supabase client for auth
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    tier: str
    credits_total: int
    credits_used: int
    credits_remaining: int


# -----------------
# AUTH ENDPOINTS
# -----------------

@router.post("/signup")
async def sign_up(request: SignUpRequest):
    """
    Create a new user account
    """
    try:
        # Sign up with Supabase Auth
        response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        if response.user:
            # Create user record in our users table
            user = await create_user(request.email)

            return {
                "success": True,
                "user_id": str(response.user.id),
                "email": request.email,
                "message": "Account created successfully. Please check your email to verify."
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to create account")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/signin")
async def sign_in(request: SignInRequest):
    """
    Sign in to existing account
    """
    try:
        response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if response.user and response.session:
            # Get user from our database
            user = await get_user_by_email(request.email)

            if not user:
                # Create user record if doesn't exist
                user = await create_user(request.email)

            # Get credits info
            credits_info = await credit_service.get_credits_info(user["id"])

            return {
                "success": True,
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token,
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "tier": credits_info["tier"],
                    "credits_remaining": credits_info["credits_remaining"]
                }
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/signout")
async def sign_out(authorization: str = Header(None)):
    """
    Sign out current user
    """
    try:
        supabase.auth.sign_out()
        return {"success": True, "message": "Signed out successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refresh")
async def refresh_token(refresh_token: str):
    """
    Refresh access token
    """
    try:
        response = supabase.auth.refresh_session(refresh_token)

        if response.session:
            return {
                "success": True,
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token
            }
        else:
            raise HTTPException(status_code=401, detail="Failed to refresh token")

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/me")
async def get_current_user(authorization: str = Header(None)):
    """
    Get current user info from JWT token
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        # Verify token with Supabase
        response = supabase.auth.get_user(token)

        if response.user:
            # Get user from our database
            user = await get_user_by_email(response.user.email)

            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # Get credits info
            credits_info = await credit_service.get_credits_info(user["id"])

            return {
                "id": user["id"],
                "email": user["email"],
                "tier": credits_info["tier"],
                "credits": {
                    "total": credits_info["credits_total"],
                    "used": credits_info["credits_used"],
                    "remaining": credits_info["credits_remaining"],
                    "resets_at": credits_info.get("period_end")
                },
                "features": credits_info["features"],
                "stripe_customer_id": user.get("stripe_customer_id")
            }
        else:
            raise HTTPException(status_code=401, detail="Invalid token")

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.post("/forgot-password")
async def forgot_password(email: EmailStr):
    """
    Send password reset email
    """
    try:
        app_url = os.getenv("APP_URL", "http://localhost:3000")
        supabase.auth.reset_password_email(
            email,
            options={
                "redirect_to": f"{app_url}/reset-password"
            }
        )
        return {"success": True, "message": "Password reset email sent"}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/reset-password")
async def reset_password(new_password: str, access_token: str):
    """
    Reset password with token
    """
    try:
        response = supabase.auth.update_user({
            "password": new_password
        })

        if response.user:
            return {"success": True, "message": "Password updated successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to update password")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# -----------------
# HELPER FUNCTIONS
# -----------------

async def get_current_user_from_token(authorization: str = Header(None)) -> dict:
    """
    Dependency to get current user from JWT token
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        response = supabase.auth.get_user(token)

        if response.user:
            user = await get_user_by_email(response.user.email)
            if user:
                return user
            raise HTTPException(status_code=404, detail="User not found")
        else:
            raise HTTPException(status_code=401, detail="Invalid token")

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
