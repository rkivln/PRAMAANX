from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from supabase import Client
from datetime import datetime, timezone
from ...config import settings
from ...dependencies import get_supabase_admin, get_current_officer

router = APIRouter()

class LoginRequest(BaseModel):
    officer_id: str
    password: str
    checkpoint_code: str
    role: str = "officer"

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: dict

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/login", response_model=dict)
async def login(payload: LoginRequest, admin: Client = Depends(get_supabase_admin)):
    if not payload.officer_id or not payload.password:
        raise HTTPException(status_code=400, detail="Officer ID and password required")

    officer_res = admin.table("officers").select("*").eq("officer_id", payload.officer_id).single().execute()
    if not officer_res.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    officer = officer_res.data
    if not officer.get("active"):
        raise HTTPException(status_code=403, detail="Inactive officer account")

    auth_res = admin.auth.sign_in_with_password({
        "email": officer["email"],
        "password": payload.password,
    })

    if not auth_res.user or not auth_res.session:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    admin.table("officers").update({
        "last_login_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", officer["id"]).execute()

    return {
        "success": True,
        "data": {
            "access_token": auth_res.session.access_token,
            "refresh_token": auth_res.session.refresh_token,
            "user": {
                "id": str(officer["id"]),
                "officer_id": officer["officer_id"],
                "name": officer["full_name"],
                "role": officer["role"],
            },
        },
    }

@router.post("/logout")
async def logout(officer: dict = Depends(get_current_officer), admin: Client = Depends(get_supabase_admin)):
    try:
        admin.auth.sign_out()
    except Exception:
        pass
    return {"success": True, "data": {"message": "Logged out"}}

@router.get("/me")
async def me(officer: dict = Depends(get_current_officer)):
    return {
        "success": True,
        "data": {
            "id": str(officer["id"]),
            "officer_id": officer["officer_id"],
            "name": officer["full_name"],
            "role": officer["role"],
            "email": officer.get("email"),
            "rank": officer.get("rank"),
            "unit": officer.get("unit"),
        },
    }

@router.post("/refresh")
async def refresh(payload: RefreshRequest, admin: Client = Depends(get_supabase_admin)):
    try:
        session = admin.auth.refresh_session(payload.refresh_token)
        return {
            "success": True,
            "data": {
                "access_token": session.session.access_token,
                "refresh_token": session.session.refresh_token,
            },
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")