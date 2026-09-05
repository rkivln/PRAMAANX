from fastapi import APIRouter, Depends, Query
from typing import Optional
from supabase import Client
from ...dependencies import get_supabase, get_admin_officer

router = APIRouter()

@router.get("/stats", response_model=dict)
async def get_admin_stats(
    admin: dict = Depends(get_admin_officer),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.rpc("get_admin_stats").execute()
    if not result.data:
        return {
            "success": True,
            "data": {
                "total_verifications": 0,
                "verified": 0,
                "pending_review": 0,
                "rejected": 0,
                "active_officers": 0,
                "active_checkpoints": 0,
            },
        }

    data = result.data[0]
    return {
        "success": True,
        "data": {
            "total_verifications": data.get("total_verifications", 0),
            "verified": data.get("verified", 0),
            "pending_review": data.get("pending_review", 0),
            "rejected": data.get("rejected", 0),
            "active_officers": data.get("active_officers", 0),
            "active_checkpoints": data.get("active_checkpoints", 0),
        },
    }

@router.get("/verifications", response_model=dict)
async def list_all_verifications(
    checkpoint: Optional[str] = None,
    decision: Optional[str] = None,
    date: Optional[str] = None,
    officer: Optional[str] = None,
    document_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    admin: dict = Depends(get_admin_officer),
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("verification_sessions").select(
        "id, verification_id, officer_id, checkpoint_id, status, started_at, completed_at, demo_mode, officers(full_name, officer_id), checkpoints(checkpoint_code, name)"
    ).order("started_at", desc=True)

    if checkpoint:
        query = query.eq("checkpoint_id", checkpoint)
    if decision:
        query = query.eq("status", decision)
    if date:
        query = query.gte("started_at", date).lte("started_at", date + "T23:59:59")
    if officer:
        query = query.eq("officer_id", officer)

    result = query.range((page - 1) * page_size, page * page_size).execute()

    items = []
    for row in (result.data or []):
        items.append({
            "id": str(row.get("id")),
            "verification_id": row.get("verification_id"),
            "timestamp": row.get("started_at"),
            "checkpoint": row.get("checkpoints", {}).get("checkpoint_code") if row.get("checkpoints") else None,
            "officer": row.get("officers", {}).get("full_name") if row.get("officers") else None,
            "decision": row.get("status"),
            "risk": None,
        })

    return {
        "success": True,
        "data": {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": len(items),
        },
    }
