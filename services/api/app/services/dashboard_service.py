"""
PRAMAANX — Dashboard Service

Provides dashboard statistics from PostgreSQL.
"""

from datetime import datetime, timezone
from typing import Any, Dict
from supabase import Client


class DashboardService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_dashboard(self, officer: dict) -> Dict[str, Any]:
        today = datetime.now(timezone.utc).date().isoformat()

        if officer["role"] in ("admin", "supervisor"):
            result = self.supabase.table("verification_sessions").select("*", count="exact").gte("started_at", today).execute()
            total = result.count or 0
            verified = self.supabase.table("verification_sessions").select("*", count="exact").eq("status", "verified").gte("started_at", today).execute()
            pending = self.supabase.table("verification_sessions").select("*", count="exact").eq("status", "pending_review").gte("started_at", today).execute()
            rejected = self.supabase.table("verification_sessions").select("*", count="exact").eq("status", "rejected").gte("started_at", today).execute()
        else:
            result = self.supabase.table("verification_sessions").select("*", count="exact").eq("officer_id", officer["id"]).gte("started_at", today).execute()
            total = result.count or 0
            verified = self.supabase.table("verification_sessions").select("*", count="exact").eq("officer_id", officer["id"]).eq("status", "verified").gte("started_at", today).execute()
            pending = self.supabase.table("verification_sessions").select("*", count="exact").eq("officer_id", officer["id"]).eq("status", "pending_review").gte("started_at", today).execute()
            rejected = self.supabase.table("verification_sessions").select("*", count="exact").eq("officer_id", officer["id"]).eq("status", "rejected").gte("started_at", today).execute()

        v_count = verified.count or 0
        r_count = rejected.count or 0
        success_rate = (v_count / total * 100) if total > 0 else 0.0

        recent = self.supabase.table("verification_sessions").select(
            "verification_id, started_at, status, officers(full_name, officer_id), checkpoints(checkpoint_code, name), document_captures(document_type), risk_assessments(risk_level)"
        ).order("started_at", desc=True).limit(10).execute()

        recent_items = []
        for row in (recent.data or []):
            officers = row.get("officers")
            officer_name = officers[0]["full_name"] if officers and len(officers) > 0 else "Unknown"
            checkpoints = row.get("checkpoints")
            checkpoint_code = checkpoints[0]["checkpoint_code"] if checkpoints and len(checkpoints) > 0 else "Unknown"
            doc_captures = row.get("document_captures")
            doc_type = doc_captures[0]["document_type"] if doc_captures and len(doc_captures) > 0 else "Document"
            risk = row.get("risk_assessments")
            risk_level = risk[0]["risk_level"] if risk and len(risk) > 0 else "LOW"

            recent_items.append({
                "id": row.get("verification_id"),
                "t": datetime.fromisoformat(row.get("started_at", "")).strftime("%H:%M") if row.get("started_at") else "",
                "doc": doc_type,
                "nm": "***",
                "dec": row.get("status", "PENDING").upper(),
                "fm": "—",
                "risk": risk_level,
                "off": officer_name,
                "st": "Closed" if row.get("status") in ("verified", "rejected") else "Pending",
                "timestamp": row.get("started_at"),
                "checkpoint": checkpoint_code,
                "workstation": "WS-CHK-01",
            })

        return {
            "success": True,
            "data": {
                "stats": {
                    "today_total": total,
                    "verified_count": v_count,
                    "pending_count": pending.count or 0,
                    "rejected_count": r_count,
                    "high_risk_count": 0,
                    "tripwire_count": 0,
                    "success_rate": round(success_rate, 2),
                },
                "recent_verifications": recent_items,
                "engine_status": {
                    "local_engine": "Operational",
                    "ocr": "Ready",
                    "face_engine": "Ready",
                    "mrz_parser": "Active",
                    "ai_service": "Available" if settings.ENABLE_AI_OPINION else "Unavailable",
                },
                "sync_status": "Queued" if not settings.ENABLE_CLOUD_SYNC else "Synced",
            },
        }
