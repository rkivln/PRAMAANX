from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from supabase import Client
from ..config import settings
from ..dependencies import get_supabase, get_supabase_admin, get_current_officer, get_supervisor_officer
from ..services.verification_service import VerificationService
from ..services.risk_service import RiskEngine
from ..services.audit_service import AuditService

router = APIRouter()

class CreateVerificationRequest(BaseModel):
    checkpoint_id: str
    demo_mode: bool = False

class DocumentCaptureRequest(BaseModel):
    document_type: Optional[str] = None
    document_number_masked: Optional[str] = None
    subject_name_masked: Optional[str] = None
    date_of_birth_masked: Optional[str] = None
    issuing_authority: Optional[str] = None
    image_sha256: Optional[str] = None
    capture_resolution: Optional[str] = None
    mime_type: Optional[str] = None
    ocr_text: Optional[Dict[str, Any]] = None
    mrz_data: Optional[Dict[str, Any]] = None
    document_metadata: Optional[Dict[str, Any]] = None

class BiometricResultRequest(BaseModel):
    face_detected: bool
    face_quality_score: float
    face_similarity_score: float
    liveness_score: float
    liveness_status: str
    face_match_status: str
    model_name: str
    model_version: str

class DecisionRequest(BaseModel):
    action: str
    reason: Optional[str] = None
    confirmation: bool = False

class EvidenceRequest(BaseModel):
    evidence: Dict[str, Any]

@router.post("/", response_model=dict)
async def create_verification(
    payload: CreateVerificationRequest,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    return await verification_service.create_session(officer, payload.checkpoint_id, payload.demo_mode)

@router.get("/{verification_id}", response_model=dict)
async def get_verification(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.get_session(verification_id, officer)
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}

@router.post("/{verification_id}/document", response_model=dict)
async def submit_document(
    verification_id: str,
    payload: DocumentCaptureRequest,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.submit_document(verification_id, officer, payload.dict(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}

@router.post("/{verification_id}/document/analyze", response_model=dict)
async def analyze_document(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.analyze_document(verification_id, officer)
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}

@router.post("/{verification_id}/face", response_model=dict)
async def submit_face(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.submit_face(verification_id, officer)
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}

@router.post("/{verification_id}/biometric/analyze", response_model=dict)
async def analyze_biometric(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.analyze_biometric(verification_id, officer)
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}

@router.post("/{verification_id}/forensics/analyze", response_model=dict)
async def analyze_forensics(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.run_forensics(verification_id, officer)
    return {"success": True, "data": result}

@router.post("/{verification_id}/consistency", response_model=dict)
async def run_consistency(
    verification_id: str,
    payload: EvidenceRequest,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.run_consistency(verification_id, officer, payload.evidence)
    return {"success": True, "data": result}

@router.get("/{verification_id}/consistency", response_model=dict)
async def get_consistency(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    session = await verification_service.get_session(verification_id, officer)
    if not session:
        raise HTTPException(status_code=404, detail="Verification not found")

    checks = supabase.table("cross_stream_checks").select("*").eq("verification_session_id", session["id"]).execute()
    checks_data = checks.data or []
    mismatch_count = sum(1 for c in checks_data if c.get("status") == "MISMATCH")
    uncertain_count = sum(1 for c in checks_data if c.get("status") == "UNCERTAIN")
    critical_count = sum(1 for c in checks_data if c.get("severity") == "CRITICAL")

    return {
        "success": True,
        "data": {
            "checks": checks_data,
            "mismatch_count": mismatch_count,
            "uncertain_count": uncertain_count,
            "critical_count": critical_count,
        }
    }

@router.post("/{verification_id}/risk", response_model=dict)
async def calculate_risk(
    verification_id: str,
    payload: EvidenceRequest,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.run_risk(verification_id, officer, payload.evidence)
    return {"success": True, "data": result}

@router.get("/{verification_id}/risk", response_model=dict)
async def get_risk(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    session = await verification_service.get_session(verification_id, officer)
    if not session:
        raise HTTPException(status_code=404, detail="Verification not found")

    risk = supabase.table("risk_assessments").select("*").eq("verification_session_id", session["id"]).order("created_at", desc=True).limit(1).execute()
    risk_data = risk.data[0] if risk.data else {}

    tripwires = supabase.table("hard_tripwires").select("*").eq("verification_session_id", session["id"]).execute()
    tripwire_triggered = len(tripwires.data or []) > 0

    return {
        "success": True,
        "data": {
            "risk_score": float(risk_data.get("risk_score", 0.0)) if risk_data else 0.0,
            "risk_level": risk_data.get("risk_level", "LOW"),
            "confidence": float(risk_data.get("confidence", 0.0)) if risk_data else 0.0,
            "tripwire_triggered": tripwire_triggered,
            "recommended_action": risk_data.get("decision_recommendation", "AUTO_CLEAR_CANDIDATE"),
            "requires_officer_confirmation": risk_data.get("risk_level") in ("HIGH", "CRITICAL") or tripwire_triggered,
            "reasons": risk_data.get("reasons", []) if risk_data else [],
            "triggered_rules": [],
            "rules_version": risk_data.get("rules_version", ""),
        }
    }

@router.get("/{verification_id}/result", response_model=dict)
async def get_result(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.get_result(verification_id, officer)
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}

@router.get("/{verification_id}/report", response_model=dict)
async def get_report(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    result = await verification_service.get_report(verification_id, officer)
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}

@router.post("/{verification_id}/decision", response_model=dict)
async def record_decision(
    verification_id: str,
    payload: DecisionRequest,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    if payload.action not in ("APPROVE", "REVIEW", "REJECT", "SECONDARY_REVIEW"):
        raise HTTPException(status_code=400, detail="Invalid action")

    decision_map = {"APPROVE": "VERIFIED", "REVIEW": "REVIEW", "REJECT": "REJECTED", "SECONDARY_REVIEW": "REVIEW"}
    verification_service = VerificationService(supabase)
    audit_service = AuditService(supabase)
    result = await verification_service.record_decision(
        verification_id, officer, decision_map[payload.action], payload.reason or "", audit_service, payload.confirmation
    )
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}
