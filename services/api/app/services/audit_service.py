import hashlib
import json
from datetime import datetime, timezone
from supabase import Client

class AuditService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def log(
        self,
        session_id: str = None,
        officer_id: str = None,
        checkpoint_id: str = None,
        workstation_id: str = None,
        event_code: str = "",
        action_description: str = "",
        result: str = "",
        metadata: dict = None,
    ):
        previous = self.supabase.table("audit_logs").select("event_hash").order("event_timestamp", desc=True).limit(1).execute()
        previous_hash = previous.data[0]["event_hash"] if previous.data else None

        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "officer_id": officer_id,
            "event_code": event_code,
            "verification_id": session_id,
            "action_description": action_description,
            "result": result,
            "previous_hash": previous_hash,
        }
        event_hash = hashlib.sha256(json.dumps(payload, sort_keys=True, default=str).encode()).hexdigest()

        self.supabase.table("audit_logs").insert({
            "verification_session_id": session_id,
            "officer_id": officer_id,
            "checkpoint_id": checkpoint_id,
            "workstation_id": workstation_id,
            "event_code": event_code,
            "action_description": action_description,
            "result": result,
            "metadata": metadata or {},
            "event_timestamp": datetime.now(timezone.utc).isoformat(),
            "previous_hash": previous_hash,
            "event_hash": event_hash,
        }).execute()
