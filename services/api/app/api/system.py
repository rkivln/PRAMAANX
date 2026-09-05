from fastapi import APIRouter, Depends
from supabase import Client
from ..dependencies import get_supabase, get_current_officer

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

@router.post("/status/refresh", response_model=dict)
async def refresh_system_status(
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    api_health = {"component": "API", "status": "Operational", "message": "FastAPI backend running", "checked_at": None}
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get("http://127.0.0.1:5000/api/health", timeout=2.0)
            api_health = {"component": "API", "status": "Operational", "message": f"HTTP {resp.status_code}", "checked_at": None}
    except Exception:
        api_health = {"component": "API", "status": "Unavailable", "message": "Cannot reach API", "checked_at": None}

    supabase.table("system_events").upsert({
        "component": api_health["component"],
        "status": api_health["status"],
        "message": api_health["message"],
    }).execute()

    return {"success": True, "data": api_health}
