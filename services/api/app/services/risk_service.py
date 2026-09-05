"""
PRAMAANX — Risk Engine

Deterministic weighted evidence fusion for risk calculation.
Produces risk scores and levels.
Does NOT use random values.
Does NOT use LLM as calculator.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List
from supabase import Client
from .audit_service import AuditService


class RiskEngine:
    """Deterministic risk calculation engine."""

    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.version = "PRAMAANX-RISK-1.0"
        self.rules = self._load_rules()

    def _load_rules(self) -> Dict[str, Any]:
        """Load risk rules configuration."""
        return {
            "weights": {
                "document_authenticity": 0.25,
                "face_similarity": 0.25,
                "liveness": 0.20,
                "tamper": 0.15,
                "ocr_confidence": 0.10,
                "cross_stream": 0.05,
            },
            "thresholds": {
                "low_max": 25,
                "medium_max": 65,
                "high_min": 66,
            },
            "hard_tripwires": [
                "PKI_SIGNATURE_INVALID",
                "LIVENESS_EXPLICIT_FAIL",
                "BLACKLIST_MATCH",
                "IMPOSSIBLE_MRZ_CHECKSUM",
                "CONFIRMED_TAMPERING",
                "SEVERE_IDENTITY_CONFLICT",
            ],
        }

    async def calculate(self, verification_session_id: str, officer_id: str, checkpoint_id: str, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate risk score and level.
        
        Args:
            verification_session_id: Session ID
            officer_id: Officer ID
            checkpoint_id: Checkpoint ID
            evidence: Combined evidence dictionary
            
        Returns:
            RiskResult with score, level, reasons, tripwires
        """
        signals = []
        reasons = []
        triggered_rules = []

        # Document authenticity signal
        doc_auth = self._score_document_authenticity(evidence)
        signals.append(doc_auth)
        if doc_auth["value"] < 0.5:
            reasons.append("Low document authenticity score")
            triggered_rules.append("LOW_DOCUMENT_AUTHENTICITY")

        # Face similarity signal
        face_sim = self._score_face_similarity(evidence)
        signals.append(face_sim)
        if face_sim["value"] < 0.5:
            reasons.append("Borderline face similarity")
            triggered_rules.append("LOW_FACE_SIMILARITY")

        # Liveness signal
        liveness = self._score_liveness(evidence)
        signals.append(liveness)
        if liveness["value"] < 0.5:
            reasons.append("Liveness check failed")
            triggered_rules.append("LIVENESS_FAIL")

        # Tamper signal
        tamper = self._score_tamper(evidence)
        signals.append(tamper)
        if tamper["value"] < 0.5:
            reasons.append("Tamper indicators detected")
            triggered_rules.append("TAMPER_DETECTED")

        # OCR confidence signal
        ocr_conf = self._score_ocr_confidence(evidence)
        signals.append(ocr_conf)
        if ocr_conf["value"] < 0.5:
            reasons.append("Low OCR confidence")
            triggered_rules.append("LOW_OCR_CONFIDENCE")

        # Cross-stream consistency signal
        cross_stream = self._score_cross_stream(evidence)
        signals.append(cross_stream)
        if cross_stream["value"] < 0.5:
            reasons.append("Cross-stream consistency issues detected")
            triggered_rules.append("CROSS_STREAM_MISMATCH")

        # Hard tripwires
        tripwires = self._check_tripwires(evidence)
        tripwire_triggered = len(tripwires) > 0
        if tripwire_triggered:
            reasons.extend([f"HARD TRIPWIRE: {t['reason']}" for t in tripwires])
            triggered_rules.extend([t["tripwire_code"] for t in tripwires])

        # Compute weighted score
        risk_score = self._compute_weighted_score(signals)
        risk_level = self._determine_risk_level(risk_score, tripwire_triggered)
        recommended_action = self._recommend_action(risk_score, tripwire_triggered)

        if not reasons:
            reasons = ["All checks within acceptable parameters"]

        # Store risk signals
        for signal in signals:
            self.supabase.table("risk_signals").insert({
                "verification_session_id": verification_session_id,
                "signal_id": signal["signal_id"],
                "signal_type": signal["signal_type"],
                "weight": signal["weight"],
                "value": signal["value"],
                "confidence": signal["confidence"],
                "reliability": signal["reliability"],
                "direction": signal["direction"],
                "metadata": signal.get("metadata", {}),
            }).execute()

        # Store tripwires
        for tripwire in tripwires:
            self.supabase.table("hard_tripwires").insert({
                "verification_session_id": verification_session_id,
                "tripwire_code": tripwire["tripwire_code"],
                "severity": tripwire["severity"],
                "reason": tripwire["reason"],
                "requires_officer_action": True,
                "triggered": True,
                "metadata": tripwire.get("metadata", {}),
            }).execute()

        assessment = {
            "verification_session_id": verification_session_id,
            "risk_score": round(risk_score, 4),
            "risk_level": risk_level,
            "confidence": round(self._compute_confidence(signals), 4),
            "decision_recommendation": recommended_action,
            "reasons": reasons,
            "signal_summary": {s["signal_id"]: s["value"] for s in signals},
            "rules_version": self.version,
        }

        result = self.supabase.table("risk_assessments").insert(assessment).execute()

        audit = AuditService(self.supabase)
        await audit.log(
            session_id=verification_session_id,
            officer_id=officer_id,
            checkpoint_id=checkpoint_id,
            event_code="RISK_CALCULATED",
            action_description=f"Risk calculated: {risk_level} (score: {risk_score:.2f})",
            result=risk_level,
            metadata={"risk_score": risk_score, "tripwire_triggered": tripwire_triggered},
        )

        return {
            "risk_score": round(risk_score, 4),
            "risk_level": risk_level,
            "confidence": round(self._compute_confidence(signals), 4),
            "tripwire_triggered": tripwire_triggered,
            "recommended_action": recommended_action,
            "requires_officer_confirmation": risk_level in ("HIGH", "CRITICAL") or tripwire_triggered,
            "reasons": reasons,
            "triggered_rules": triggered_rules,
            "rules_version": self.version,
        }

    def _score_document_authenticity(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        doc = evidence.get("document", {})
        score = float(doc.get("authenticity_score", 0.0)) / 100.0
        return {
            "signal_id": "DOCUMENT_AUTHENTICITY",
            "signal_type": "document",
            "weight": self.rules["weights"]["document_authenticity"],
            "value": score,
            "confidence": 0.8,
            "reliability": 0.75,
            "direction": "higher_is_lower_risk",
        }

    def _score_face_similarity(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        bio = evidence.get("biometric", {})
        score = float(bio.get("face_similarity_score", 0.0)) / 100.0
        return {
            "signal_id": "FACE_MATCH",
            "signal_type": "biometric",
            "weight": self.rules["weights"]["face_similarity"],
            "value": score,
            "confidence": 0.85,
            "reliability": 0.8,
            "direction": "higher_is_lower_risk",
        }

    def _score_liveness(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        bio = evidence.get("biometric", {})
        status = bio.get("liveness_status", "FAIL")
        score = 1.0 if status == "PASS" else 0.0 if status == "FAIL" else 0.5
        return {
            "signal_id": "LIVENESS",
            "signal_type": "biometric",
            "weight": self.rules["weights"]["liveness"],
            "value": score,
            "confidence": 0.9,
            "reliability": 0.85,
            "direction": "higher_is_lower_risk",
        }

    def _score_tamper(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        doc = evidence.get("document", {})
        tamper = doc.get("tamper_status", "FLAGGED")
        score = 0.0 if tamper == "FLAGGED" else 1.0 if tamper == "CLEAN" else 0.5
        return {
            "signal_id": "TAMPER",
            "signal_type": "forensic",
            "weight": self.rules["weights"]["tamper"],
            "value": score,
            "confidence": 0.8,
            "reliability": 0.7,
            "direction": "higher_is_lower_risk",
        }

    def _score_ocr_confidence(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        doc = evidence.get("document", {})
        score = float(doc.get("ocr_confidence", 0.0)) / 100.0
        return {
            "signal_id": "OCR_CONFIDENCE",
            "signal_type": "document",
            "weight": self.rules["weights"]["ocr_confidence"],
            "value": score,
            "confidence": 0.75,
            "reliability": 0.7,
            "direction": "higher_is_lower_risk",
        }

    def _score_cross_stream(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        cross = evidence.get("cross_stream", {})
        mismatches = cross.get("mismatch_count", 0)
        uncertain = cross.get("uncertain_count", 0)
        critical = cross.get("critical_count", 0)
        
        total_checks = max(mismatches + uncertain + critical, 1)
        score = 1.0 - (mismatches * 0.3 + uncertain * 0.1 + critical * 0.5)
        score = max(0.0, min(1.0, score))
        
        return {
            "signal_id": "CROSS_STREAM",
            "signal_type": "consistency",
            "weight": self.rules["weights"]["cross_stream"],
            "value": score,
            "confidence": 0.7,
            "reliability": 0.65,
            "direction": "higher_is_lower_risk",
        }

    def _compute_weighted_score(self, signals: List[Dict[str, Any]]) -> float:
        """Compute weighted risk score (0-100)."""
        total_weight = sum(s["weight"] for s in signals)
        if total_weight == 0:
            return 0.0
        
        weighted_sum = sum(s["weight"] * s["value"] for s in signals)
        normalized = weighted_sum / total_weight
        return round(normalized * 100, 4)

    def _determine_risk_level(self, score: float, tripwire: bool) -> str:
        """Determine risk level from score."""
        if tripwire:
            return "CRITICAL"
        if score >= 66:
            return "HIGH"
        if score >= 26:
            return "MEDIUM"
        return "LOW"

    def _recommend_action(self, score: float, tripwire: bool) -> str:
        """Recommend action based on risk."""
        if tripwire:
            return "HARD_SECURITY_HOLD"
        if score >= 66:
            return "INTERDICTION_RECOMMENDED"
        if score >= 26:
            return "SECONDARY_INSPECTION"
        return "AUTO_CLEAR_CANDIDATE"

    def _compute_confidence(self, signals: List[Dict[str, Any]]) -> float:
        """Compute overall confidence in risk assessment."""
        if not signals:
            return 0.0
        confidences = [s.get("confidence", 0.0) for s in signals]
        return sum(confidences) / len(confidences)

    def _check_tripwires(self, evidence: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check for hard tripwire conditions."""
        tripwires = []

        # PKI signature invalid
        doc = evidence.get("document", {})
        sig = doc.get("signature", {})
        if sig.get("status") == "FAIL":
            tripwires.append({
                "tripwire_code": "PKI_SIGNATURE_INVALID",
                "severity": "CRITICAL",
                "reason": "Cryptographic signature validation failed",
                "metadata": {"algorithm": sig.get("algorithm")},
            })

        # Liveness explicit fail
        bio = evidence.get("biometric", {})
        if bio.get("liveness_status") == "FAIL":
            tripwires.append({
                "tripwire_code": "LIVENESS_EXPLICIT_FAIL",
                "severity": "CRITICAL",
                "reason": "Explicit liveness failure detected",
            })

        # Blacklist match
        registry = evidence.get("registry", {})
        if registry.get("blacklist_check") == "MATCH":
            tripwires.append({
                "tripwire_code": "BLACKLIST_MATCH",
                "severity": "CRITICAL",
                "reason": "Identity matches blacklist/watchlist record",
            })

        # Confirmed tampering
        if doc.get("tamper_status") == "FLAGGED":
            forensics = evidence.get("forensics", {})
            if forensics.get("overall_authenticity_score", 1.0) < 0.5:
                tripwires.append({
                    "tripwire_code": "CONFIRMED_TAMPERING",
                    "severity": "CRITICAL",
                    "reason": "Multiple forensic engines confirm tampering",
                })

        return tripwires
