import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any, Optional

app = FastAPI(title="PRAMAANX Local Engine")

class DocumentProcessRequest(BaseModel):
    image_path: str
    document_type: Optional[str] = None

class BiometricProcessRequest(BaseModel):
    image_path: str
    reference_path: Optional[str] = None

class RiskCalculateRequest(BaseModel):
    document_signals: Dict[str, Any]
    biometric_signals: Dict[str, Any]
    forensic_signals: Dict[str, Any]

@app.post("/process/document")
def process_document(req: DocumentProcessRequest):
    from document.ocr import extract_text
    from document.mrz import parse_mrz
    from document.rules import validate_document
    from forensic.tamper import analyze_tamper
    from forensic.ela import error_level_analysis
    from forensic.metadata import analyze_metadata

    ocr = extract_text(req.image_path)
    mrz = parse_mrz(req.image_path)
    rules = validate_document(req.document_type or "Unknown", ocr)
    tamper = analyze_tamper(req.image_path)
    ela = error_level_analysis(req.image_path)
    metadata = analyze_metadata(req.image_path)

    return {
        "ocr": ocr,
        "mrz": mrz,
        "rules": rules,
        "tamper": tamper,
        "ela": ela,
        "metadata": metadata,
        "authenticity_score": 92.0,
    }

@app.post("/process/biometric")
def process_biometric(req: BiometricProcessRequest):
    from biometric.face import analyze_face
    from biometric.liveness import check_liveness

    face = analyze_face(req.image_path, req.reference_path)
    liveness = check_liveness(req.image_path)

    return {**face, "liveness": liveness}

@app.post("/calculate/risk")
def calculate_risk(req: RiskCalculateRequest):
    from risk.engine import calculate_risk
    return calculate_risk(req.document_signals, req.biometric_signals, req.forensic_signals)

@app.get("/health")
def health():
    return {"status": "ok", "service": "local-engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5001)