from datetime import datetime, timezone
from fastapi import HTTPException
from supabase import Client

class RiskService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def calculate(self, verification_id: str, officer: dict) -> dict:
        session_res = self.supabase.table("verification_sessions").select("id").eq("verification_id", verification_id).single().execute()
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Verification not found")

        session_id = session_res.data["id"]
        doc = self.supabase.table("document_analysis").select("*").eq("verification_session_id", session_id).order("created_at", desc=True).limit(1).execute()
        bio = self.supabase.table("biometric_analysis").select("*").eq("verification_session_id", session_id).order("created_at", desc=True).limit(1).execute()

        doc_data = doc.data[0] if doc.data else {}
        bio_data = bio.data[0] if bio.data else {}

        authenticity = float(doc_data.get("authenticity_score", 0.0))
        similarity = float(bio_data.get("face_similarity_score", 0.0))
        liveness = bio_data.get("liveness_status", "FAIL")
        tamper = doc_data.get("tamper_status", "FLAGGED")

        risk_score = 0.0
        reasons = []

        if authenticity < 80:
            risk_score += 0.3
            reasons.append("Low document authenticity score")
        if similarity < 80:
            risk_score += 0.3
            reasons.append("Borderline face similarity")
        if liveness != "PASS":
            risk_score += 0.2
            reasons.append("Liveness check failed")
        if tamper == "FLAGGED":
            risk_score += 0.2
            reasons.append("Tamper indicators detected")

        risk_score = min(risk_score, 1.0)

        if risk_score >= 0.6:
            risk_level = "HIGH"
            recommendation = "REJECTED"
        elif risk_score >= 0.35:
            risk_level = "MEDIUM"
            recommendation = "REVIEW"
        else:
            risk_level = "LOW"
            recommendation = "VERIFIED"

        if not reasons:
            reasons = ["All checks within acceptable parameters"]

        assessment = {
            "verification_session_id": session_id,
            "risk_score": round(risk_score, 4),
            "risk_level": risk_level,
            "confidence": round(0.85, 4),
            "decision_recommendation": recommendation,
            "reasons": reasons,
            "signal_summary": {
                "document_authenticity": authenticity,
                "face_similarity": similarity,
                "liveness": liveness,
                "tamper": tamper,
            },
            "rules_version": "rules-v1.0.0",
        }
        result = self.supabase.table("risk_assessments").insert(assessment).execute()
        return result.data[0] if result.data else {}
