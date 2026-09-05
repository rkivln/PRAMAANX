from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from supabase import Client
from ...dependencies import get_supabase, get_current_officer

router = APIRouter()

@router.get("/", response_model=dict)
async def get_history(
    decision: Optional[str] = None,
    document_type: Optional[str] = None,
    officer: Optional[str] = None,
    checkpoint: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("verification_sessions").select(
        "id, verification_id, officer_id, checkpoint_id, status, started_at, completed_at, demo_mode, officers(full_name, officer_id), checkpoints(checkpoint_code, name)"
    ).order("started_at", desc=True)

    if current_officer["role"] not in ("admin", "supervisor"):
        query = query.eq("officer_id", str(current_officer["id"]))

    if decision:
        query = query.eq("status", decision)
    if checkpoint:
        query = query.eq("checkpoint_id", checkpoint)
    if date_from:
        query = query.gte("started_at", date_from)
    if date_to:
        query = query.lte("started_at", date_to)

    result = query.range((page - 1) * page_size, page * page_size).execute()

    items = []
    for row in (result.data or []):
        items.append({
            "verification_id": row.get("verification_id"),
            "timestamp": row.get("started_at"),
            "document_type": "Document",
            "subject_name_masked": "***",
            "decision": row.get("status"),
            "face_match": None,
            "risk": None,
            "officer": row.get("officers", {}).get("full_name") if row.get("officers") else None,
            "status": row.get("status"),
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