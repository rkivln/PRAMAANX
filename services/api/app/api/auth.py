from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import Client
from datetime import datetime, timezone
from ..config import settings
from ..dependencies import get_supabase_admin, get_current_officer
from ..services.audit_service import AuditService

router = APIRouter()

class LoginRequest(BaseModel):
    officer_id: str
    password: str
    checkpoint_code: str = "CHK-JALP-01"
    role: str = "officer"

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/login", response_model=dict)
async def login(payload: LoginRequest, admin: Client = Depends(get_supabase_admin)):
    audit = AuditService(admin)
    if not payload.officer_id or not payload.password:
        await audit.log(
            event_code="LOGIN_FAILED",
            action_description=f"Login failed for officer={payload.officer_id}",
            result="Missing credentials",
        )
        raise HTTPException(status_code=400, detail="Officer ID and password required")

    officer_res = admin.table("officers").select("*").eq("officer_id", payload.officer_id).single().execute()
    officer = officer_res.data if officer_res.data else {}

    if not officer:
        await audit.log(
            event_code="LOGIN_FAILED",
            action_description=f"Login failed for officer={payload.officer_id}",
            result="Officer not found",
        )
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not officer.get("active"):
        await audit.log(
            officer_id=str(officer.get("id")),
            event_code="LOGIN_FAILED",
            action_description=f"Login failed for officer={payload.officer_id}",
            result="Inactive officer",
        )
        raise HTTPException(status_code=403, detail="Inactive officer account")

    checkpoint_res = admin.table("checkpoints").select("*").eq("checkpoint_code", payload.checkpoint_code).single().execute()
    checkpoint = checkpoint_res.data if checkpoint_res.data else {}

    assignment_res = admin.table("officer_checkpoint_assignments").select("*").eq(
        "officer_id", officer["id"]
    ).eq("checkpoint_id", checkpoint.get("id")).eq("active", True).execute()

    if payload.role != "admin" and not (assignment_res.data and len(assignment_res.data) > 0):
        await audit.log(
            officer_id=str(officer.get("id")),
            event_code="LOGIN_FAILED",
            action_description=f"Login failed for officer={payload.officer_id}",
            result="Not assigned to checkpoint",
        )
        raise HTTPException(status_code=403, detail="Not assigned to this checkpoint")

    admin.table("officers").update({
        "last_login_at": datetime.now(timezone.utc).isoformat(),
    }).eq("id", officer["id"]).execute()

    await audit.log(
        officer_id=str(officer.get("id")),
        event_code="LOGIN_SUCCESS",
        action_description=f"Officer {officer.get('officer_id')} logged in",
        result="Success",
    )

    return {
        "success": True,
        "data": {
            "access_token": f"mock-token-{officer.get('officer_id')}",
            "refresh_token": f"mock-refresh-{officer.get('officer_id')}",
            "user": {
                "id": str(officer.get("id")),
                "officer_id": officer.get("officer_id"),
                "name": officer.get("full_name"),
                "role": officer.get("role", "officer"),
                "email": officer.get("email"),
                "checkpoint": checkpoint,
            },
        },
    }

@router.post("/logout")
async def logout(officer: dict = Depends(get_current_officer), admin: Client = Depends(get_supabase_admin)):
    audit = AuditService(admin)
    try:
        admin.auth.sign_out()
    except Exception:
        pass

    await audit.log(
        officer_id=officer.get("id"),
        event_code="LOGOUT",
        action_description=f"Officer {officer.get('officer_id')} logged out",
        result="Success",
    )

    return {"success": True, "data": {"message": "Logged out"}}

@router.get("/me")
async def me(officer: dict = Depends(get_current_officer)):
    return {
        "success": True,
        "data": {
            "id": str(officer.get("id")),
            "officer_id": officer.get("officer_id"),
            "name": officer.get("full_name"),
            "role": officer.get("role"),
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
