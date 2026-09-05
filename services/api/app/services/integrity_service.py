from datetime import datetime, timezone
from supabase import Client

class IntegrityService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def check_all(self) -> dict:
        result = self.supabase.rpc("verify_audit_chain").execute()
        records = result.data or []
        broken = [r for r in records if not r.get("chain_valid")]
        return {
            "valid": len(broken) == 0,
            "checked_records": len(records),
            "broken_at": broken[0]["event_timestamp"].isoformat() if broken else None,
            "message": "Chain intact" if len(broken) == 0 else f"Broken at {broken[0]['event_timestamp']}",
        }
