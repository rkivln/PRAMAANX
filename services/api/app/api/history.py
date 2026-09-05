from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from supabase import Client
from ..dependencies import get_supabase, get_current_officer

router = APIRouter()

@router.get("/", response_model=dict)
async def get_history(
    decision: Optional[str] = None,
    document_type: Optional[str] = None,
    officer: Optional[str] = None,
    checkpoint: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_officer: dict = Depends(get_current_officer),
    supabase: Client = Depends(get_supabase),
):
    query = supabase.table("verification_sessions").select(
        "id, verification_id, officer_id, checkpoint_id, status, started_at, completed_at, demo_mode, officers(full_name, officer_id), checkpoints(checkpoint_code, name), document_captures(document_type, subject_name_masked), biometric_analysis(face_similarity_score), risk_assessments(risk_level, risk_score)"
    ).order("started_at", desc=True)

    if current_officer["role"] not in ("admin", "supervisor"):
        query = query.eq("officer_id", str(current_officer["id"]))

    if decision:
        query = query.eq("status", decision)
    if checkpoint:
        query = query.eq("checkpoint_id", checkpoint)
    if date_from:
        query = query.gte("started_at", date_from)
    if date_to:
        query = query.lte("started_at", date_to + "T23:59:59")

    result = query.range((page - 1) * page_size, page * page_size).execute()

    items = []
    for row in (result.data or []):
        officers = row.get("officers")
        officer_name = officers[0]["full_name"] if officers and len(officers) > 0 else None

        checkpoints = row.get("checkpoints")
        checkpoint_code = checkpoints[0]["checkpoint_code"] if checkpoints and len(checkpoints) > 0 else None

        doc_captures = row.get("document_captures")
        doc_type = doc_captures[0]["document_type"] if doc_captures and len(doc_captures) > 0 else "Document"
        subject_name = doc_captures[0]["subject_name_masked"] if doc_captures and len(doc_captures) > 0 else "***"

        bio = row.get("biometric_analysis")
        face_match = bio[0]["face_similarity_score"] if bio and len(bio) > 0 else None

        risk = row.get("risk_assessments")
        risk_level = risk[0]["risk_level"] if risk and len(risk) > 0 else None
        risk_score = risk[0]["risk_score"] if risk and len(risk) > 0 else None

        items.append({
            "verification_id": row.get("verification_id"),
            "timestamp": row.get("started_at"),
            "document_type": doc_type,
            "subject_name_masked": subject_name,
            "decision": row.get("status"),
            "face_match": face_match,
            "risk": risk_level,
            "risk_score": risk_score,
            "officer": officer_name,
            "status": row.get("status"),
        })

    return {
        "success": True,
        "data": {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": len(items),
        },
    }
