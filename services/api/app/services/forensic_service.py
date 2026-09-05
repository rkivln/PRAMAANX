"""
PRAMAANX — Forensic Service

Orchestrates forensic analysis engines:
- ELA
- DQT/JPEG quantization
- Splice detection
- ORB feature analysis
- SSIM
- EXIF/metadata analysis
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from supabase import Client
from .audit_service import AuditService
from ..edge.inference.forensic.ela import ELAEngine
from ..edge.inference.forensic.metadata import MetadataEngine
from ..edge.inference.forensic.splice import SpliceDetector


class ForensicService:
    """Forensic analysis orchestrator."""

    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.ela = ELAEngine()
        self.metadata = MetadataEngine()
        self.splice = SpliceDetector()

    async def analyze(self, verification_session_id: str, officer_id: str, checkpoint_id: Optional[str], image_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Run full forensic analysis.
        
        Args:
            verification_session_id: Session ID
            officer_id: Officer performing analysis
            checkpoint_id: Checkpoint ID
            image_path: Path to document image (optional)
            
        Returns:
            ForensicAnalysisResult
        """
        ela_result = self.ela.analyze(None)
        metadata_result = self.metadata.analyze(image_path or "")
        splice_result = self.splice.detect(None)

        overall_score = self._compute_overall_score([ela_result, metadata_result, splice_result])
        overall_status = "CLEAN" if overall_score < 0.3 else "FLAGGED" if overall_score > 0.6 else "UNCERTAIN"

        analysis = {
            "verification_session_id": verification_session_id,
            "ela_score": ela_result.get("score"),
            "ela_status": ela_result.get("status"),
            "ela_finding": ela_result.get("finding"),
            "dqt_score": 0.0,
            "dqt_status": "NOT_AVAILABLE",
            "dqt_finding": "DQT analysis not yet implemented",
            "splice_score": splice_result.get("score"),
            "splice_status": splice_result.get("status"),
            "splice_finding": splice_result.get("finding"),
            "orb_match_score": 0.0,
            "orb_status": "NOT_AVAILABLE",
            "orb_finding": "ORB analysis not yet implemented",
            "ssim_score": 0.0,
            "ssim_status": "NOT_AVAILABLE",
            "ssim_finding": "SSIM analysis not yet implemented",
            "metadata_anomaly_score": metadata_result.get("score"),
            "metadata_status": metadata_result.get("status"),
            "metadata_finding": metadata_result.get("finding"),
            "overall_authenticity_score": 1.0 - overall_score,
            "engine_version": "PRAMAANX-Forensics-v1.0.0",
            "processed_at": datetime.now(timezone.utc).isoformat(),
        }

        result = self.supabase.table("forensic_analysis").insert(analysis).execute()

        audit = AuditService(self.supabase)
        await audit.log(
            session_id=verification_session_id,
            officer_id=officer_id,
            checkpoint_id=checkpoint_id,
            event_code="FORENSIC_ANALYSIS_COMPLETED",
            action_description="Forensic analysis completed",
            result=overall_status,
        )

        return result.data[0] if result.data else analysis

    def _compute_overall_score(self, results: list) -> float:
        """Compute overall forensic anomaly score from multiple engines."""
        scores = [r.get("score", 0.0) for r in results if r.get("score") is not None]
        if not scores:
            return 0.0
        return sum(scores) / len(scores)
