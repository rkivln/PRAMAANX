def calculate_risk(document_signals: dict, biometric_signals: dict, forensic_signals: dict) -> dict:
    risk_score = 0.0
    reasons = []

    authenticity = float(document_signals.get("authenticity_score", 0.0))
    similarity = float(biometric_signals.get("face_similarity_score", 0.0))
    liveness = biometric_signals.get("liveness_status", "FAIL")
    tamper = document_signals.get("tamper_status", "FLAGGED")

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

    return {
        "risk_score": round(risk_score, 4),
        "risk_level": risk_level,
        "confidence": 0.85,
        "decision_recommendation": recommendation,
        "reasons": reasons,
        "rules_version": "rules-v1.0.0",
    }