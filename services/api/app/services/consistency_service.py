"""
PRAMAANX — Consistency Service

Orchestrates cross-stream validation.
"""

from typing import Any, Dict
from supabase import Client
from .cross_stream_service import CrossStreamValidator
from .audit_service import AuditService


class ConsistencyService:
    """Cross-stream consistency orchestrator."""

    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.validator = CrossStreamValidator()

    async def validate(self, verification_session_id: str, officer_id: str, checkpoint_id: str, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run cross-stream validation and store results.
        
        Args:
            verification_session_id: Session ID
            officer_id: Officer ID
            checkpoint_id: Checkpoint ID
            evidence: Combined evidence dictionary
            
        Returns:
            CrossStreamResult
        """
        result = self.validator.validate(evidence)

        # Store individual checks
        checks_to_insert = []
        for check in result.get("checks", []):
            checks_to_insert.append({
                "verification_session_id": verification_session_id,
                "check_id": check.get("check_id"),
                "check_name": check.get("name"),
                "stream_a": check.get("stream_a"),
                "stream_b": check.get("stream_b"),
                "comparison": check.get("comparison"),
                "status": check.get("status"),
                "severity": check.get("severity", "LOW"),
                "confidence": check.get("confidence", 0.0),
                "reason": check.get("reason"),
            })
        
        if checks_to_insert:
            self.supabase.table("cross_stream_checks").insert(checks_to_insert).execute()

        audit = AuditService(self.supabase)
        await audit.log(
            session_id=verification_session_id,
            officer_id=officer_id,
            checkpoint_id=checkpoint_id,
            event_code="CROSS_STREAM_CHECK_COMPLETED",
            action_description=f"Cross-stream validation completed: {result.get('overall_status')}",
            result=result.get("overall_status"),
        )

        return result
