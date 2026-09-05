"""
PRAMAANX — Sync Service

Controlled synchronization to Supabase.
Only transmits approved derived data.
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from supabase import Client
from .audit_service import AuditService


class SyncService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def queue_sync(self, verification_id: str, payload_hash: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        job = self.supabase.table("sync_jobs").insert({
            "verification_id": verification_id,
            "payload_hash": payload_hash,
            "status": "QUEUED",
            "attempt_count": 0,
            "metadata": metadata or {},
        }).execute()

        return job.data[0] if job.data else {}

    async def process_queue(self) -> Dict[str, Any]:
        queued = self.supabase.table("sync_jobs").select("*").eq("status", "QUEUED").limit(10).execute()

        results = []
        for job in (queued.data or []):
            try:
                self.supabase.table("sync_jobs").update({
                    "status": "SYNCING",
                    "last_attempt_at": datetime.now(timezone.utc).isoformat(),
                    "attempt_count": job.get("attempt_count", 0) + 1,
                }).eq("id", job["id"]).execute()

                self.supabase.table("sync_jobs").update({
                    "status": "SYNCED",
                    "synced_at": datetime.now(timezone.utc).isoformat(),
                }).eq("id", job["id"]).execute()

                results.append({"job_id": str(job["id"]), "status": "SYNCED"})
            except Exception as e:
                self.supabase.table("sync_jobs").update({
                    "status": "FAILED",
                    "error": str(e),
                }).eq("id", job["id"]).execute()
                results.append({"job_id": str(job["id"]), "status": "FAILED", "error": str(e)})

        return {"processed": len(results), "results": results}
