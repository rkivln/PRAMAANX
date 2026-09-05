"""
PRAMAANX — Integrity Service

Verifies audit chain integrity.
"""

from typing import Any, Dict
from supabase import Client


class IntegrityService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def verify_chain(self) -> Dict[str, Any]:
        result = self.supabase.rpc("verify_audit_chain").execute()
        if not result.data:
            return {
                "valid": True,
                "records_checked": 0,
                "first_invalid_record": None,
                "message": "No audit records to verify",
            }

        records = result.data
        broken = [r for r in records if not r.get("chain_valid")]
        first_broken = broken[0] if broken else None

        return {
            "valid": len(broken) == 0,
            "records_checked": len(records),
            "first_invalid_record": str(first_broken["id"]) if first_broken else None,
            "message": "Chain intact" if len(broken) == 0 else f"Broken at record {first_broken['id']}",
        }
