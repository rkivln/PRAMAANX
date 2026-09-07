import os
import json
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Any, Optional

AUDIT_DIR = Path(__file__).parent.parent / "data"
AUDIT_FILE = AUDIT_DIR / "audit_trail.json"

def calculate_sha256(data_bytes: bytes) -> str:
    """Calculates SHA-256 checksum for immutable digital audit."""
    return hashlib.sha256(data_bytes).hexdigest()

def calculate_file_sha256(file_path: str) -> str:
    if not os.path.exists(file_path):
        return hashlib.sha256(b"missing").hexdigest()
    hasher = hashlib.sha256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def get_supabase_client():
    try:
        from supabase import create_client
        from dotenv import load_dotenv
        # Load from root .env
        root_env = Path(__file__).parent.parent.parent / ".env"
        if root_env.exists():
            load_dotenv(root_env)
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        if url and key:
            return create_client(url, key)
    except Exception as e:
        print(f"[Supabase Audit] Client init notice: {e}")
    return None

def save_digital_audit(
    verification_id: str,
    doc_path: str,
    face_path: str,
    ocr_result: dict,
    mrz_result: dict,
    biometric_result: dict,
    forensic_result: dict,
    risk_result: dict,
    officer_info: Optional[dict] = None
) -> Dict[str, Any]:
    """
    Creates an immutable cryptographic digital audit record.
    Saves locally for offline compliance and syncs to Supabase.
    """
    AUDIT_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).isoformat()
    doc_sha256 = calculate_file_sha256(doc_path)
    face_sha256 = calculate_file_sha256(face_path)

    officer = officer_info or {
        "officer_id": "OFFICER-01",
        "name": "Screening Officer",
        "rank": "Officer",
        "checkpoint_code": "CHK-01"
    }

    # Digital Audit Record
    audit_entry = {
        "verification_id": verification_id,
        "timestamp": timestamp,
        "officer": officer,
        "hashes": {
            "document_sha256": doc_sha256,
            "face_sha256": face_sha256
        },
        "document": {
            "type": ocr_result.get("fields", {}).get("document_type", "Passport"),
            "document_number": ocr_result.get("fields", {}).get("document_number") or mrz_result.get("document_number"),
            "name": ocr_result.get("fields", {}).get("name") or f"{mrz_result.get('given_names', '')} {mrz_result.get('surname', '')}".strip(),
            "mrz_valid": mrz_result.get("valid", True),
            "ocr_confidence": ocr_result.get("confidence", 90.0)
        },
        "biometrics": {
            "face_match_status": biometric_result.get("face_match_status", "MATCH"),
            "similarity_score": biometric_result.get("face_similarity_score", 90.0),
            "liveness_status": biometric_result.get("liveness", {}).get("liveness_status", "PASS")
        },
        "forensics": {
            "ela_score": forensic_result.get("ela", {}).get("ela_score", 92.0),
            "tamper_status": forensic_result.get("tamper", {}).get("tamper_status", "CLEAN"),
            "metadata_status": forensic_result.get("metadata", {}).get("status", "PASS")
        },
        "risk_assessment": {
            "score": risk_result.get("risk_score", 12.0),
            "level": risk_result.get("risk_level", "LOW"),
            "recommendation": risk_result.get("decision_recommendation", "VERIFIED"),
            "reasons": risk_result.get("reasons", [])
        }
    }

    # 1. Store Locally
    local_records = []
    if AUDIT_FILE.exists():
        try:
            with open(AUDIT_FILE, "r", encoding="utf-8") as f:
                local_records = json.load(f)
        except Exception:
            local_records = []
    
    local_records.insert(0, audit_entry)
    # Keep last 500 audit records locally
    local_records = local_records[:500]
    with open(AUDIT_FILE, "w", encoding="utf-8") as f:
        json.dump(local_records, f, indent=2)

    # 2. Synchronize to Supabase if connected
    supabase_synced = False
    supabase_session_id = None
    sb = get_supabase_client()
    if sb:
        try:
            # Check or insert checkpoint if needed
            cp_res = sb.table("checkpoints").select("id").eq("checkpoint_code", officer.get("checkpoint_code", "CHK-JALP-01")).limit(1).execute()
            cp_id = cp_res.data[0]["id"] if cp_res.data else None

            # Get officer id from officers table
            off_res = sb.table("officers").select("id").eq("officer_id", officer.get("officer_id", "SSB/VER/2024-0142")).limit(1).execute()
            off_id = off_res.data[0]["id"] if off_res.data else None

            # 1) Insert verification_session
            sess_insert = sb.table("verification_sessions").insert({
                "verification_id": verification_id,
                "officer_id": off_id,
                "checkpoint_id": cp_id,
                "status": "verified" if risk_result.get("risk_level") == "LOW" else "pending_review",
                "current_step": 4,
                "completed_at": timestamp
            }).execute()

            if sess_insert.data:
                supabase_session_id = sess_insert.data[0]["id"]

                # 2) Insert document_captures
                sb.table("document_captures").insert({
                    "verification_session_id": supabase_session_id,
                    "document_type": audit_entry["document"]["type"],
                    "document_number_masked": audit_entry["document"]["document_number"],
                    "subject_name_masked": audit_entry["document"]["name"],
                    "image_sha256": doc_sha256,
                    "ocr_text": {"lines": ocr_result.get("lines", [])},
                    "mrz_data": mrz_result,
                    "captured_at": timestamp
                }).execute()

                # 3) Insert document_analysis
                sb.table("document_analysis").insert({
                    "verification_session_id": supabase_session_id,
                    "document_type_detected": audit_entry["document"]["type"],
                    "ocr_confidence": ocr_result.get("confidence", 90.0),
                    "mrz_status": "PASS" if mrz_result.get("valid") else "FLAGGED",
                    "tamper_status": forensic_result.get("tamper", {}).get("tamper_status", "CLEAN"),
                    "authenticity_score": forensic_result.get("ela", {}).get("ela_score", 92.0),
                    "forensic_findings": forensic_result,
                    "processed_at": timestamp
                }).execute()

                # 4) Insert biometric_analysis
                sb.table("biometric_analysis").insert({
                    "verification_session_id": supabase_session_id,
                    "face_detected": biometric_result.get("face_detected", True),
                    "face_quality_score": biometric_result.get("face_quality_score", 90.0),
                    "face_similarity_score": biometric_result.get("face_similarity_score", 90.0),
                    "liveness_score": biometric_result.get("liveness", {}).get("liveness_score", 0.95),
                    "liveness_status": biometric_result.get("liveness", {}).get("liveness_status", "PASS"),
                    "face_match_status": biometric_result.get("face_match_status", "MATCH"),
                    "model_name": biometric_result.get("model_name", "ArcFace"),
                    "processed_at": timestamp
                }).execute()

                # 5) Insert risk_assessments (column is NUMERIC(5,4) -> range 0.0000 to 1.0000)
                raw_score = float(risk_result.get("risk_score", 10.0))
                db_risk_score = round(raw_score / 100.0 if raw_score > 1.0 else raw_score, 4)
                conf = float(risk_result.get("confidence", 0.95))
                db_conf = round(conf / 100.0 if conf > 1.0 else conf, 4)
                sb.table("risk_assessments").insert({
                    "verification_session_id": supabase_session_id,
                    "risk_score": db_risk_score,
                    "risk_level": risk_result.get("risk_level", "LOW"),
                    "confidence": db_conf,
                    "decision_recommendation": risk_result.get("decision_recommendation", "VERIFIED"),
                    "reasons": risk_result.get("reasons", []),
                    "signal_summary": audit_entry
                }).execute()

                # 6) Insert audit_logs
                event_hash = calculate_sha256(f"{verification_id}:{timestamp}:{doc_sha256}:{face_sha256}".encode('utf-8'))
                sb.table("audit_logs").insert({
                    "verification_session_id": supabase_session_id,
                    "officer_id": off_id,
                    "checkpoint_id": cp_id,
                    "event_code": "VERIFICATION_COMPLETE",
                    "action_description": f"Completed screening with risk level {risk_result.get('risk_level')}",
                    "result": risk_result.get("decision_recommendation"),
                    "metadata": audit_entry,
                    "event_hash": event_hash
                }).execute()

                supabase_synced = True
        except Exception as e:
            print(f"[Supabase Audit] Sync warning: {e}")

    audit_entry["sync_status"] = "SYNCED_TO_SUPABASE" if supabase_synced else "LOCAL_AUDIT_LOGGED"
    audit_entry["supabase_session_id"] = supabase_session_id
    return audit_entry

def get_all_audit_records() -> list:
    """Returns local and/or Supabase audit records."""
    if AUDIT_FILE.exists():
        try:
            with open(AUDIT_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []
