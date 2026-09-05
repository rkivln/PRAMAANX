from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from supabase import Client
from uuid import UUID
from ...config import settings
from ...dependencies import get_supabase, get_supabase_admin, get_current_officer, get_supervisor_officer
from ...services.verification_service import VerificationService
from ...services.risk_service import RiskService
from ...services.audit_service import AuditService

router = APIRouter()

class CreateVerificationRequest(BaseModel):
    checkpoint_id: str

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
    action: str  # APPROVE, REVIEW, REJECT
    reason: Optional[str] = None

@router.post("/", response_model=dict)
async def create_verification(
    payload: CreateVerificationRequest,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    verification_service = VerificationService(supabase)
    return await verification_service.create_session(officer, payload.checkpoint_id)

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

@router.post("/{verification_id}/risk", response_model=dict)
async def calculate_risk(
    verification_id: str,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    risk_service = RiskService(supabase)
    result = await risk_service.calculate(verification_id, officer)
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}

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

@router.post("/{verification_id}/decision", response_model=dict)
async def record_decision(
    verification_id: str,
    payload: DecisionRequest,
    officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    if payload.action not in ("APPROVE", "REVIEW", "REJECT"):
        raise HTTPException(status_code=400, detail="Invalid action")

    decision_map = {"APPROVE": "VERIFIED", "REVIEW": "REVIEW", "REJECT": "REJECTED"}
    verification_service = VerificationService(supabase)
    audit_service = AuditService(supabase)
    result = await verification_service.record_decision(
        verification_id, officer, decision_map[payload.action], payload.reason, audit_service
    )
    if not result:
        raise HTTPException(status_code=404, detail="Verification not found")
    return {"success": True, "data": result}