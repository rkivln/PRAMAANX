"""
PRAMAANX — Verification State Machine

Defines valid status transitions for verification sessions.
"""

from enum import Enum


class VerificationStatus(str, Enum):
    STARTED = "started"
    DOCUMENT_CAPTURED = "document_captured"
    DOCUMENT_ANALYZING = "document_analyzing"
    DOCUMENT_ANALYZED = "document_analyzed"
    FACE_CAPTURED = "face_captured"
    BIOMETRIC_ANALYZING = "biometric_analyzing"
    BIOMETRIC_ANALYZED = "biometric_analyzed"
    FORENSIC_ANALYZING = "forensic_analyzing"
    FORENSIC_ANALYZED = "forensic_analyzed"
    CONSISTENCY_CHECKING = "consistency_checking"
    CONSISTENCY_CHECKED = "consistency_checked"
    RISK_CALCULATING = "risk_calculating"
    RISK_CALCULATED = "risk_calculated"
    PENDING_REVIEW = "pending_review"
    VERIFIED = "verified"
    REJECTED = "rejected"
    ESCALATED = "escalated"
    CANCELLED = "cancelled"


VALID_TRANSITIONS = {
    VerificationStatus.STARTED: [
        VerificationStatus.DOCUMENT_CAPTURED,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.DOCUMENT_CAPTURED: [
        VerificationStatus.DOCUMENT_ANALYZING,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.DOCUMENT_ANALYZING: [
        VerificationStatus.DOCUMENT_ANALYZED,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.DOCUMENT_ANALYZED: [
        VerificationStatus.FACE_CAPTURED,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.FACE_CAPTURED: [
        VerificationStatus.BIOMETRIC_ANALYZING,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.BIOMETRIC_ANALYZING: [
        VerificationStatus.BIOMETRIC_ANALYZED,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.BIOMETRIC_ANALYZED: [
        VerificationStatus.FORENSIC_ANALYZING,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.FORENSIC_ANALYZING: [
        VerificationStatus.FORENSIC_ANALYZED,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.FORENSIC_ANALYZED: [
        VerificationStatus.CONSISTENCY_CHECKING,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.CONSISTENCY_CHECKING: [
        VerificationStatus.CONSISTENCY_CHECKED,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.CONSISTENCY_CHECKED: [
        VerificationStatus.RISK_CALCULATING,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.RISK_CALCULATING: [
        VerificationStatus.RISK_CALCULATED,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.RISK_CALCULATED: [
        VerificationStatus.PENDING_REVIEW,
        VerificationStatus.VERIFIED,
        VerificationStatus.REJECTED,
        VerificationStatus.ESCALATED,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.PENDING_REVIEW: [
        VerificationStatus.VERIFIED,
        VerificationStatus.REJECTED,
        VerificationStatus.ESCALATED,
        VerificationStatus.CANCELLED,
    ],
    VerificationStatus.VERIFIED: [],
    VerificationStatus.REJECTED: [],
    VerificationStatus.ESCALATED: [],
    VerificationStatus.CANCELLED: [],
}


def is_valid_transition(current_status: str, new_status: str) -> bool:
    """Check if a status transition is valid."""
    try:
        current = VerificationStatus(current_status)
        target = VerificationStatus(new_status)
        allowed = VALID_TRANSITIONS.get(current, [])
        return target in allowed
    except ValueError:
        return False


def get_allowed_transitions(current_status: str) -> List[str]:
    """Get list of allowed next statuses."""
    try:
        current = VerificationStatus(current_status)
        allowed = VALID_TRANSITIONS.get(current, [])
        return [s.value for s in allowed]
    except ValueError:
        return []
