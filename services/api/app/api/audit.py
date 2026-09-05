from fastapi import APIRouter, Depends, Query
from typing import Optional
from supabase import Client
from datetime import datetime
from ...dependencies import get_supabase, get_current_officer, get_supervisor_officer

router = APIRouter()

@router.get("/", response_model=dict)
async def get_audit_trail(
    event_code: Optional[str] = None,
    officer_id: Optional[str] = None,
    date: Optional[str] = None,
    verification_id: Optional[str] = None,
    result: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    officer: dict = Depends(get_supervisor_officer),
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("audit_logs").select(
        "id, event_code, action_description, result, event_timestamp, verification_session_id, officer_id, checkpoint_id, workstation_id, verification_sessions(verification_id)"
    ).order("event_timestamp", desc=True)

    if event_code:
        query = query.eq("event_code", event_code)
    if officer_id:
        query = query.eq("officer_id", officer_id)
    if verification_id:
        query = query.eq("verification_session_id", verification_id)
    if result:
        query = query.eq("result", result)
    if date:
        query = query.gte("event_timestamp", date).lte("event_timestamp", date + "T23:59:59")

    result_data = query.range((page - 1) * page_size, page * page_size).execute()

    items = []
    for row in (result_data.data or []):
        vs = row.get("verification_sessions")
        items.append({
            "timestamp": row.get("event_timestamp"),
            "officer_id": str(row.get("officer_id")) if row.get("officer_id") else None,
            "event_code": row.get("event_code"),
            "verification_id": vs.get("verification_id") if vs else None,
            "action": row.get("action_description"),
            "result": row.get("result"),
            "workstation": str(row.get("workstation_id")) if row.get("workstation_id") else None,
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

@router.get("/integrity", response_model=dict)
async def get_audit_integrity(
    officer: dict = Depends(get_supervisor_officer),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.rpc("verify_audit_chain").execute()
    if not result.data:
        return {"valid": True, "checked_records": 0, "broken_at": None, "message": "No audit records"}

    records = result.data
    broken = [r for r in records if not r.get("chain_valid")]
    broken_at = broken[0]["event_timestamp"] if broken else None

    return {
        "valid": len(broken) == 0,
        "checked_records": len(records),
        "broken_at": broken_at.isoformat() if broken_at else None,
        "message": "Chain intact" if len(broken) == 0 else f"Broken at {broken_at}",
    }
