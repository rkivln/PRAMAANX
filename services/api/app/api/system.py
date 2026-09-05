from fastapi import APIRouter, Depends
from supabase import Client
from ...dependencies import get_supabase, get_current_officer

router = APIRouter()

@router.get("/status", response_model=dict)
async def get_system_status(
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    events_res = supabase.table("system_events").select("*").order("checked_at", desc=True).execute()
    events = events_res.data or []

    components = []
    for ev in events:
        components.append({
            "component": ev.get("component"),
            "status": ev.get("status"),
            "detail": ev.get("message"),
            "last_checked": ev.get("checked_at"),
        })

    return {
        "success": True,
        "data": {
            "components": components,
            "overall": "Operational" if all(c.get("status") != "Unavailable" for c in components) else "Degraded",
        },
    }
