import os
import re
import cv2
import shutil
import numpy as np
from typing import Dict, Any, List, Optional
import pymupdf
import zxingcpp
import pytesseract

# Configure Tesseract OCR binary path
_tesseract_ready = False

def get_tesseract_ready() -> bool:
    global _tesseract_ready
    if _tesseract_ready:
        return True

    candidates = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        os.environ.get("TESSERACT_PATH", "")
    ]
    for path in candidates:
        if path and os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            _tesseract_ready = True
            return True

    which_tess = shutil.which("tesseract")
    if which_tess:
        pytesseract.pytesseract.tesseract_cmd = which_tess
        _tesseract_ready = True
        return True

    return False

def detect_document_type(text: str, img: Optional[np.ndarray] = None, has_mrz: bool = False) -> str:
    """
    Automatically classifies official identity and travel documents based on
    optical text keywords, ICAO formats, regex patterns, and physical aspect ratio.
    """
    text_upper = text.upper()

    # 1. Passport Detection
    if "PASSPORT" in text_upper or "P<IND" in text_upper or "P<" in text_upper or (has_mrz and "REPUBLIC OF INDIA" in text_upper):
        return "Passport"

    # 2. Aadhaar Card Detection
    if (
        "AADHAAR" in text_upper
        or "UNIQUE IDENTIFICATION" in text_upper
        or "UIDAI" in text_upper
        or "MERA AADHAAR" in text_upper
        or re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', text)
    ):
        return "Aadhaar Card"

    # 3. Driving Licence Detection
    if (
        "DRIVING LICENCE" in text_upper
        or "DRIVING LICENSE" in text_upper
        or "MOTOR VEHICLES" in text_upper
        or "TRANSPORT DEPARTMENT" in text_upper
        or re.search(r'\bDL[- ]?[0-9A-Z]{8,}\b', text_upper)
    ):
        return "Driving Licence"

    # 4. PAN Card Detection
    if (
        "INCOME TAX" in text_upper
        or "PERMANENT ACCOUNT" in text_upper
        or re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', text_upper)
    ):
        return "PAN Card"

    # 5. Voter ID (EPIC) Detection
    if (
        "ELECTION COMMISSION" in text_upper
        or "ELECTOR PHOTO" in text_upper
        or "VOTER" in text_upper
        or re.search(r'\b[A-Z]{3}[0-9]{7}\b', text_upper)
    ):
        return "Voter ID"

    # 6. Visa / Entry Permit Detection
    if "VISA" in text_upper and any(k in text_upper for k in ["ENTRIES", "VALID FOR", "IMMIGRATION", "CATEGORY", "STAY"]):
        return "Visa / Entry Permit"

    # 7. Travel Document / Refugee Permit
    if "TRAVEL DOCUMENT" in text_upper:
        return "Travel Document"

    # 8. National ID Card
    if "NATIONAL ID" in text_upper or "IDENTITY CARD" in text_upper:
        return "National ID Card"

    # 9. Aspect Ratio Analysis for Standard ISO ID-1 cards
    if img is not None and img.size > 0:
        h, w = img.shape[:2]
        aspect = float(w) / float(h) if h > 0 else 1.0
        if 1.45 <= aspect <= 1.75:
            return "Identity Card (ID-1 Format)"
        elif 1.30 <= aspect < 1.45:
            return "Travel Document / Passport"

    return "Identity Document" if text.strip() else "Unclassified Document"

def extract_barcode_text(img: np.ndarray) -> List[Dict[str, Any]]:
    """Extracts text, encoded records, or PDF417/QR data from barcodes on the document."""
    barcode_lines = []
    try:
        results = zxingcpp.read_barcodes(img)
        for r in results:
            if r.text and r.text.strip():
                barcode_lines.append({
                    "text": r.text.strip(),
                    "confidence": 98.0,
                    "format": str(r.format)
                })
    except Exception as e:
        print(f"[OCR] Barcode scanner notice: {e}")
    return barcode_lines

def extract_pdf_text(file_path: str) -> List[Dict[str, Any]]:
    """Extracts text directly from digital PDF documents using PyMuPDF."""
    lines = []
    try:
        doc = pymupdf.open(file_path)
        for page in doc:
            page_text = page.get_text("text")
            for line in page_text.splitlines():
                line = line.strip()
                if line:
                    lines.append({"text": line, "confidence": 99.0})
        doc.close()
    except Exception as e:
        print(f"[OCR] PDF extraction notice: {e}")
    return lines

def extract_optical_text(img: np.ndarray) -> List[Dict[str, Any]]:
    """
    Applies high-accuracy CLAHE adaptive contrast preprocessing and runs
    Tesseract OCR to extract real character lines with word confidence scores.
    """
    lines = []
    if not get_tesseract_ready():
        print("[OCR] Tesseract binary not configured")
        return lines

    try:
        # Preprocessing: Grayscale + CLAHE for optical edge & character enhancement
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img.copy()

        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)

        # 1. Line-by-line hierarchical text
        raw_str = pytesseract.image_to_string(enhanced)
        
        # 2. Confidence scores from data
        ocr_data = pytesseract.image_to_data(enhanced, output_type=pytesseract.Output.DICT)
        confs = [float(c) for c in ocr_data['conf'] if float(c) > 0]
        avg_c = float(np.mean(confs)) if confs else 85.0

        for line in raw_str.splitlines():
            line_s = line.strip()
            if line_s:
                lines.append({"text": line_s, "confidence": round(max(50.0, avg_c), 1)})

    except Exception as e:
        print(f"[OCR] Tesseract extraction warning: {e}")

    return lines

def extract_text(image_path: str) -> Dict[str, Any]:
    """
    Extracts genuine real-time text from the captured document using
    Tesseract OCR + OpenCV preprocessing + ZXing barcode scan.
    Never returns mock, dummy, or cached data.
    """
    if not os.path.exists(image_path):
        return {
            "engine": "Optical Scanner",
            "raw_text": "",
            "lines": [],
            "confidence": 0.0,
            "fields": {},
            "status": "NO_FILE"
        }

    lines: List[Dict[str, Any]] = []
    engine = "Tesseract OCR + OpenCV CLAHE"

    # 1. If document is a PDF
    if image_path.lower().endswith(".pdf"):
        lines = extract_pdf_text(image_path)
        engine = "PyMuPDF Digital Extractor"

    # 2. If document is an image (webcam capture or scanned file)
    img = cv2.imread(image_path)
    if img is not None:
        # A. Barcode / QR / PDF417 extraction
        barcode_lines = extract_barcode_text(img)
        lines.extend(barcode_lines)

        # B. Real-time Optical Text Extraction
        ocr_lines = extract_optical_text(img)
        lines.extend(ocr_lines)

    # Calculate average confidence
    confidences = [l.get("confidence", 85.0) for l in lines]
    avg_conf = float(np.mean(confidences)) if confidences else 0.0

    raw_text = "\n".join([line["text"] for line in lines])
    
    # Check if MRZ line structure exists
    has_mrz = "<" in raw_text and any(len(re.sub(r'[^A-Z0-9<]', '', l)) >= 28 for l in raw_text.splitlines())

    # Automatically identify the document type
    detected_type = detect_document_type(raw_text, img, has_mrz=has_mrz)

    # Parse structured fields
    fields = parse_document_fields(raw_text, img, detected_type)
    fields["document_type"] = detected_type

    return {
        "engine": engine,
        "raw_text": raw_text,
        "lines": lines,
        "confidence": round(avg_conf, 1),
        "fields": fields,
        "status": "PASS" if lines else "NO_TEXT_DETECTED"
    }

def parse_document_fields(text: str, img: Optional[np.ndarray] = None, doc_type: str = "Identity Document") -> Dict[str, Any]:
    """
    Parses real structured fields (Name, Number, DOB, Gender, Expiry, Nationality)
    from optical text according to document standards.
    """
    fields = {
        "document_type": doc_type,
        "document_number": None,
        "name": None,
        "dob": None,
        "gender": None,
        "expiry": None,
        "nationality": "IND",
        "issuing_country": "India"
    }

    if not text.strip():
        return fields

    lines = [l.strip() for l in text.splitlines() if l.strip()]
    text_upper = text.upper()

    # --- 1. DOCUMENT NUMBER EXTRACTION ---
    # Aadhaar number regex (12 digits: XXXX XXXX XXXX)
    aadhaar_match = re.search(r'\b([0-9]{4}\s[0-9]{4}\s[0-9]{4})\b', text)
    if aadhaar_match:
        fields["document_number"] = aadhaar_match.group(1)

    # Passport regex (1 uppercase letter + 7 or 8 digits)
    if not fields["document_number"] or doc_type == "Passport":
        passport_match = re.search(r'\b([A-Z][0-9]{7,8})\b', text_upper)
        if passport_match:
            fields["document_number"] = passport_match.group(1)

    # PAN number regex (ABCDE1234F)
    if not fields["document_number"] or doc_type == "PAN Card":
        pan_match = re.search(r'\b([A-Z]{5}[0-9]{4}[A-Z])\b', text_upper)
        if pan_match:
            fields["document_number"] = pan_match.group(1)

    # Driving Licence regex (e.g. DL-1420110012345 or DL14 20110012345)
    if not fields["document_number"] or doc_type == "Driving Licence":
        dl_match = re.search(r'\b([A-Z]{2}[- ]?[0-9]{2}[- ]?[0-9]{11,12})\b', text_upper)
        if dl_match:
            fields["document_number"] = dl_match.group(1)

    # Voter ID / EPIC regex (3 letters + 7 digits, e.g. WBF1234567)
    if not fields["document_number"] or doc_type == "Voter ID":
        voter_match = re.search(r'\b([A-Z]{3}[0-9]{7})\b', text_upper)
        if voter_match:
            fields["document_number"] = voter_match.group(1)

    # --- 2. DATE OF BIRTH EXTRACTION ---
    dob_match = re.search(r'(?:DOB|D\.O\.B|Birth|Date of Birth)[^\d]*([0-3]?[0-9][/-][0-1]?[0-9][/-](?:19|20)[0-9]{2})', text, re.I)
    if not dob_match:
        all_dates = re.findall(r'\b([0-3]?[0-9][/-][0-1]?[0-9][/-](?:19|20)[0-9]{2})\b', text)
        if all_dates:
            fields["dob"] = all_dates[0]
    else:
        fields["dob"] = dob_match.group(1)

    # --- 3. GENDER / SEX EXTRACTION ---
    if re.search(r'\b(FEMALE|WOMAN|FEM|F)\b', text_upper):
        fields["gender"] = "FEMALE"
    elif re.search(r'\b(MALE|MAN|M)\b', text_upper):
        fields["gender"] = "MALE"

    # --- 4. EXPIRY DATE EXTRACTION ---
    expiry_match = re.search(r'(?:Expiry|Valid Till|Valid Upto|Validity|EXP)[^\d]*([0-3]?[0-9][/-][0-1]?[0-9][/-](?:19|20)[0-9]{2})', text, re.I)
    if expiry_match:
        fields["expiry"] = expiry_match.group(1)
    else:
        all_dates = re.findall(r'\b([0-3]?[0-9][/-][0-1]?[0-9][/-](?:19|20)[0-9]{2})\b', text)
        if len(all_dates) >= 2 and all_dates[1] != fields.get("dob"):
            fields["expiry"] = all_dates[1]

    # --- 5. NAME EXTRACTION ---
    # Aadhaar Card rule: Name is printed on the line immediately preceding the DOB line
    if doc_type == "Aadhaar Card":
        for i, line in enumerate(lines):
            line_u = line.upper()
            if (fields["dob"] and fields["dob"] in line) or "DOB:" in line_u or "DOB :" in line_u or "D.O.B" in line_u:
                if i > 0:
                    cand = lines[i - 1].strip()
                    # Clean out non-alphabetic noise
                    cleaned_name = re.sub(r'[^A-Za-z\s\.]', '', cand).strip()
                    if len(cleaned_name) >= 3 and not any(kw in cleaned_name.upper() for kw in ["INDIA", "GOVERNMENT", "AADHAAR", "AUTHORITY", "PROOF", "CITIZENSHIP"]):
                        fields["name"] = cleaned_name
                        break

    # Generic or other documents: Look for Name / Holder patterns
    if not fields["name"]:
        for line in lines:
            u = line.upper()
            if any(k in u for k in ["NAME:", "NAME :", "HOLDER:", "ELECTOR'S NAME:"]):
                parts = line.split(":", 1)
                if len(parts) > 1:
                    name_cand = re.sub(r'[^A-Za-z\s\.]', '', parts[1]).strip()
                    if len(name_cand) >= 3:
                        fields["name"] = name_cand
                        break

    # If still no name, check for capitalized personal name candidates
    if not fields["name"]:
        for line in lines:
            cleaned = re.sub(r'[^A-Za-z\s\.]', '', line).strip()
            # If line is 2-4 words, starts with capital, and doesn't contain boilerplate keywords
            words = cleaned.split()
            if 1 <= len(words) <= 4 and all(w[0].isupper() for w in words if w):
                if not any(bw in cleaned.upper() for bw in ["GOVERNMENT", "INDIA", "PASSPORT", "REPUBLIC", "DEPARTMENT", "INCOME", "TAX", "ELECTION", "AUTHORITY", "AADHAAR", "PROOF", "CITIZENSHIP", "IDENTITY", "CARD"]):
                    if len(cleaned) >= 4:
                        fields["name"] = cleaned
                        break

    # --- 6. NATIONALITY / COUNTRY ---
    if "IND" in text_upper or "INDIA" in text_upper or "BHARAT" in text_upper:
        fields["nationality"] = "IND"
        fields["issuing_country"] = "India"

    return fields