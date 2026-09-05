from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from supabase import Client
from ..dependencies import get_supabase, get_current_officer

router = APIRouter()

class CheckpointSelectRequest(BaseModel):
    checkpoint_code: str

class CheckpointResponse(BaseModel):
    id: str
    checkpoint_code: str
    name: str
    location: Optional[str]
    checkpoint_type: Optional[str]
    status: str

@router.get("/", response_model=dict)
async def list_checkpoints(officer: dict = Depends(get_current_officer), supabase: Client = Depends(get_supabase)):
    result = supabase.table("checkpoints").select("*").eq("status", "active").order("checkpoint_code").execute()
    return {
        "success": True,
        "data": [CheckpointResponse(**r).dict() for r in result.data] if result.data else [],
    }

@router.get("/{checkpoint_code}", response_model=dict)
async def get_checkpoint(checkpoint_code: str, officer: dict = Depends(get_current_officer), supabase: Client = Depends(get_supabase)):
    result = supabase.table("checkpoints").select("*").eq("checkpoint_code", checkpoint_code).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Checkpoint not found")
    return {"success": True, "data": CheckpointResponse(**result.data).dict()}

@router.post("/select", response_model=dict)
async def select_checkpoint(
    payload: CheckpointSelectRequest,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    cp_res = supabase.table("checkpoints").select("*").eq("checkpoint_code", payload.checkpoint_code).single().execute()
    if not cp_res.data:
        raise HTTPException(status_code=404, detail="Checkpoint not found")

    checkpoint = cp_res.data
    assignment_res = supabase.table("officer_checkpoint_assignments").select("*").eq(
        "officer_id", officer["id"]
    ).eq("checkpoint_id", checkpoint["id"]).eq("active", True).execute()

    allowed = officer["role"] == "admin" or (assignment_res.data and len(assignment_res.data) > 0)
    if not allowed:
        raise HTTPException(status_code=403, detail="Not assigned to this checkpoint")

    return {
        "success": True,
        "data": {
            "checkpoint": CheckpointResponse(**checkpoint).dict(),
            "assigned": allowed,
            "officer_role": officer["role"],
        },
    }
