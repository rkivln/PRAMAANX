"""
PRAMAANX — Pydantic Schemas

Request and response schemas for the FastAPI backend.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class LoginRequest(BaseModel):
    email: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


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
    face_quality_score: float = Field(ge=0, le=100)
    face_similarity_score: float = Field(ge=0, le=100)
    liveness_score: float = Field(ge=0, le=1)
    liveness_status: str
    face_match_status: str
    model_name: str
    model_version: str


class DecisionRequest(BaseModel):
    action: str
    reason: Optional[str] = None
    confirmation: bool = False


class CrossStreamCheckResponse(BaseModel):
    check_id: str
    name: str
    status: str
    severity: str
    confidence: float
    reason: str


class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    confidence: float
    tripwire_triggered: bool
    recommended_action: str
    requires_officer_confirmation: bool
    reasons: List[str]
    triggered_rules: List[str]
    rules_version: str


class AuditIntegrityResponse(BaseModel):
    valid: bool
    records_checked: int
    first_invalid_record: Optional[str] = None
    message: str


class SystemComponentResponse(BaseModel):
    name: str
    status: str
    detail: str
    operational: bool


class DashboardStatsResponse(BaseModel):
    today_total: int
    verified_count: int
    pending_count: int
    rejected_count: int
    high_risk_count: int
    tripwire_count: int
    success_rate: float


class ReportResponse(BaseModel):
    verification_id: str
    timestamp: str
    officer: Dict[str, Any]
    checkpoint: Dict[str, Any]
    workstation: Dict[str, Any]
    decision: str
    risk: Dict[str, Any]
    document: Dict[str, Any]
    biometric: Dict[str, Any]
    forensics: Dict[str, Any]
    cross_stream_checks: List[Dict[str, Any]]
    tripwires: List[Dict[str, Any]]
    model_versions: Dict[str, str]
    audit_hash: str
