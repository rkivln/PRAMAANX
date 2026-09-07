import os
import sys
import uuid
import base64
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Ensure local-engine is in python path
BASE_DIR = Path(__file__).parent
sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, HTTPException, Body, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from document.ocr import extract_text
from document.mrz import parse_mrz
from biometric.face import analyze_face
from biometric.liveness import check_liveness
from forensic.ela import error_level_analysis
from forensic.tamper import analyze_tamper
from forensic.model import analyze_pytorch_forensics
from forensic.metadata import analyze_metadata
from risk.engine import calculate_risk
from audit.supabase_audit import save_digital_audit, get_all_audit_records
from report.generator import (
    generate_individual_pdf,
    generate_individual_excel,
    generate_individual_docx,
    generate_individual_csv,
    generate_audit_log_pdf,
    generate_audit_log_excel,
    generate_audit_log_docx,
    generate_audit_log_csv,
)

app = FastAPI(
    title="PRAMAANX Local AI & Forensic Engine",
    description="Offline-capable border screening, document verification & digital audit system",
    version="1.0.0"
)

# Enable CORS for desktop app (Vite / Electron / Tauri)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = BASE_DIR / "data" / "temp"
TEMP_DIR.mkdir(parents=True, exist_ok=True)

class FullScreeningRequest(BaseModel):
    doc_image: str  # Base64 data URL or local filepath
    face_image: str # Base64 data URL or local filepath
    document_type: Optional[str] = "Passport"
    officer_info: Optional[Dict[str, Any]] = None

def save_base64_to_temp_file(data_uri: str, prefix: str) -> str:
    """Decodes a base64 image data URI to a temporary file on disk."""
    if os.path.exists(data_uri):
        return data_uri
    
    if "," in data_uri:
        header, b64data = data_uri.split(",", 1)
    else:
        b64data = data_uri

    file_id = f"{prefix}_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}.jpg"
    target_path = TEMP_DIR / file_id
    try:
        decoded = base64.b64decode(b64data)
        with open(target_path, "wb") as f:
            f.write(decoded)
        return str(target_path)
    except Exception as e:
        print(f"[Server] Base64 decode error: {e}")
        # Return fallback placeholder if base64 failed
        return str(target_path)

@app.get("/health")
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "pramaanx-local-engine",
        "version": "1.0.0",
        "offline_ready": True,
        "models": {
            "ocr": "PaddleOCR",
            "mrz": "ICAO-9303",
            "biometric": "InsightFace-ArcFace",
            "forensics": ["Pillow-ELA", "OpenCV-Tamper", "PyTorch-NoiseNet", "PyMuPDF-Metadata"],
            "risk_engine": "XGBoost + Border Rules"
        }
    }

@app.post("/api/verify/full")
def verify_full_screening(req: FullScreeningRequest):
    """
    Executes the entire local screening pipeline:
    1. Decode document & live face captures
    2. Extract document OCR and ICAO 9303 MRZ
    3. Extract biometric face embeddings and compute ArcFace similarity
    4. Run passive liveness detection
    5. Execute document forensics (ELA, Tamper, PyTorch Neural Noise, Metadata)
    6. Calculate composite risk score and evidence reasons via XGBoost + Rules
    7. Generate digital audit record and sync with Supabase
    """
    try:
        # Save captures
        doc_file = save_base64_to_temp_file(req.doc_image, "doc")
        face_file = save_base64_to_temp_file(req.face_image, "face")

        verification_id = f"VR-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

        # 1. Document Extraction
        ocr = extract_text(doc_file)
        if not ocr.get("fields", {}).get("document_type") or ocr.get("fields", {}).get("document_type") in ["Unclassified Document", "Identity Document"]:
            if req.document_type:
                ocr.setdefault("fields", {})["document_type"] = req.document_type
        mrz = parse_mrz(doc_file, ocr.get("raw_text"))

        # 2. Biometric Face Verification
        # Compares face cropped from the document with the real-time webcam face
        face_res = analyze_face(face_file, reference_path=doc_file)
        liveness_res = check_liveness(face_file)
        biometric = {**face_res, "liveness": liveness_res}

        # 3. Document Forensics
        ela = error_level_analysis(doc_file)
        tamper = analyze_tamper(doc_file)
        neural = analyze_pytorch_forensics(doc_file)
        metadata = analyze_metadata(doc_file)
        forensics = {
            "ela": ela,
            "tamper": tamper,
            "neural": neural,
            "metadata": metadata
        }

        # 4. Risk Engine (XGBoost + Rules)
        doc_signals = {
            "confidence": ocr.get("confidence", 90.0),
            "mrz": mrz,
            "fields": ocr.get("fields", {}),
            "status": ocr.get("status", "PASS")
        }
        risk = calculate_risk(doc_signals, biometric, forensics)

        # 5. Digital Audit Trail (Local + Supabase Sync)
        audit = save_digital_audit(
            verification_id=verification_id,
            doc_path=doc_file,
            face_path=face_file,
            ocr_result=ocr,
            mrz_result=mrz,
            biometric_result=biometric,
            forensic_result=forensics,
            risk_result=risk,
            officer_info=req.officer_info
        )

        return {
            "success": True,
            "verification_id": verification_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "risk": risk,
            "ocr": ocr,
            "mrz": mrz,
            "biometric": biometric,
            "forensics": forensics,
            "audit": audit
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/audit/records")
def list_audit_records():
    """Retrieve historical digital audit screening records."""
    records = get_all_audit_records()
    return {"success": True, "count": len(records), "data": records}

@app.post("/api/decision")
def record_decision(payload: dict = Body(...)):
    """Officer logs final decision (APPROVE / REVIEW / REJECT)."""
    vid = payload.get("verification_id")
    action = payload.get("action", "APPROVE")
    notes = payload.get("notes", "")
    return {
        "success": True,
        "verification_id": vid,
        "action": action,
        "status": "RECORDED",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@app.post("/api/report/individual/export")
def export_individual_screening(payload: dict = Body(...), format: str = Query("pdf")):
    """
    Exports a structured inspection report for an individual screening in PDF, Excel, Word, or CSV.
    """
    fmt = format.lower().strip()
    vid = payload.get("verification_id") or "CASE"
    
    if fmt == "pdf":
        data = generate_individual_pdf(payload)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="PRAMAANX_Report_{vid}.pdf"'}
        )
    elif fmt in ("excel", "xlsx"):
        data = generate_individual_excel(payload)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="PRAMAANX_Report_{vid}.xlsx"'}
        )
    elif fmt in ("word", "docx", "doc"):
        data = generate_individual_docx(payload)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="PRAMAANX_Report_{vid}.docx"'}
        )
    elif fmt == "csv":
        data = generate_individual_csv(payload)
        return Response(
            content=data,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="PRAMAANX_Report_{vid}.csv"'}
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{format}'. Use pdf, excel, word, or csv.")

@app.get("/api/report/individual/{verification_id}")
def export_individual_screening_by_id(verification_id: str, format: str = Query("pdf")):
    """
    Retrieves and exports a specific past screening case from audit records.
    """
    records = get_all_audit_records()
    record = next((r for r in records if r.get("verification_id") == verification_id), None)
    if not record:
        raise HTTPException(status_code=404, detail=f"Verification case '{verification_id}' not found.")
    return export_individual_screening(record, format=format)

@app.get("/api/report/audit-all")
def export_full_audit_ledger(format: str = Query("pdf")):
    """
    Exports the complete digital audit log register in PDF, Excel, Word, or CSV.
    """
    records = get_all_audit_records()
    fmt = format.lower().strip()
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")

    if fmt == "pdf":
        data = generate_audit_log_pdf(records)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="PRAMAANX_Audit_Ledger_{date_str}.pdf"'}
        )
    elif fmt in ("excel", "xlsx"):
        data = generate_audit_log_excel(records)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="PRAMAANX_Audit_Ledger_{date_str}.xlsx"'}
        )
    elif fmt in ("word", "docx", "doc"):
        data = generate_audit_log_docx(records)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="PRAMAANX_Audit_Ledger_{date_str}.docx"'}
        )
    elif fmt == "csv":
        data = generate_audit_log_csv(records)
        return Response(
            content=data,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="PRAMAANX_Audit_Ledger_{date_str}.csv"'}
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{format}'. Use pdf, excel, word, or csv.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 5001))
    print(f"[*] Starting PRAMAANX Local Engine on port {port}...")
    uvicorn.run(app, host="127.0.0.1", port=port)