from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from supabase import Client
from ...dependencies import get_supabase, get_current_officer, get_supervisor_officer
from ...services.audit_service import AuditService

router = APIRouter()

class ReviewActionRequest(BaseModel):
    action: str  # REVIEW, APPROVE, REJECT, ESCALATE
    reason: Optional[str] = None

@router.get("/pending", response_model=dict)
async def list_pending_reviews(
    officer: dict = Depends(get_supervisor_officer),
    supabase: Client = Depends(get_supabase),
):
    result = supabase.table("verification_sessions").select(
        "id, verification_id, officer_id, checkpoint_id, started_at, demo_mode, officers(full_name, officer_id), checkpoints(checkpoint_code, name), risk_assessments(risk_level, risk_score, reasons), document_captures(document_type)"
    ).eq("status", "pending_review").order("started_at", desc=True).execute()

    items = []
    for row in (result.data or []):
        doc = row.get("document_captures")
        doc_type = doc[0]["document_type"] if doc and len(doc) > 0 else "Unknown"
        risk = row.get("risk_assessments")
        risk_level = risk[0]["risk_level"] if risk and len(risk) > 0 else "MEDIUM"
        reasons = risk[0]["reasons"] if risk and len(risk) > 0 else []
        triggered = reasons[0] if reasons else "Pending review"

        items.append({
            "verification_id": row.get("verification_id"),
            "time": row.get("started_at"),
            "document_type": doc_type,
            "triggered_rule": triggered,
            "risk_level": risk_level,
            "officer": row.get("officers", {}).get("full_name") if row.get("officers") else "Unknown",
        })

    return {"success": True, "data": items}

@router.post("/{verification_id}/review", response_model=dict)
async def review_case(
    verification_id: str,
    payload: ReviewActionRequest,
    officer: dict = Depends(get_supervisor_officer),
    supabase: Client = Depends(get_supabase),
):
    session_res = supabase.table("verification_sessions").select("id").eq("verification_id", verification_id).single().execute()
    if not session_res.data:
        raise HTTPException(status_code=404, detail="Verification not found")

    session = session_res.data
    supabase.table("review_actions").insert({
        "verification_session_id": session["id"],
        "reviewer_id": officer["id"],
        "action": payload.action,
        "reason": payload.reason,
    }).execute()

    audit_service = AuditService(supabase)
    await audit_service.log(
        session_id=session["id"],
        officer_id=officer["id"],
        event_code="REVIEW_FLAGGED",
        action_description=f"Review action: {payload.action}",
        result=payload.action,
    )

    return {"success": True, "data": {"message": "Review action recorded"}}

@router.post("/{verification_id}/approve", response_model=dict)
async def approve_case(
    verification_id: str,
    payload: ReviewActionRequest,
    officer: dict = Depends(get_supervisor_officer),
    supabase: Client = Depends(get_supabase),
):
    return await review_case(verification_id, payload, officer, supabase)

@router.post("/{verification_id}/reject", response_model=dict)
async def reject_case(
    verification_id: str,
    payload: ReviewActionRequest,
    officer: dict = Depends(get_supervisor_officer),
    supabase: Client = Depends(get_supabase),
):
    return await review_case(verification_id, payload, officer, supabase)

@router.post("/{verification_id}/escalate", response_model=dict)
async def escalate_case(
    verification_id: str,
    payload: ReviewActionRequest,
    officer: dict = Depends(get_supervisor_officer),
    supabase: Client = Depends(get_supabase),
):
    return await review_case(verification_id, payload, officer, supabase)