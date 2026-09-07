import os
from typing import Dict, Any, List
from PIL import Image
from PIL.ExifTags import TAGS
import pymupdf

EDITING_SOFTWARE_SIGNATURES = [
    "photoshop", "gimp", "canva", "illustrator", "corel",
    "photopea", "paint.net", "pixelmator", "affinity", "lightroom"
]

def analyze_metadata(file_path: str) -> Dict[str, Any]:
    """
    Examines file metadata using PyMuPDF (for PDFs) and Pillow EXIF (for images).
    Identifies photo editing software traces, creation/modification discrepancies,
    and metadata anomalies.
    """
    if not os.path.exists(file_path):
        return {
            "status": "PASS",
            "software_tampering": False,
            "detected_software": "None",
            "anomalies": [],
            "metadata_fields": {}
        }

    anomalies = []
    detected_software = None
    software_tampering = False
    meta_dict = {}

    lower_path = file_path.lower()
    if lower_path.endswith(".pdf"):
        # Use PyMuPDF to extract PDF metadata
        try:
            doc = pymupdf.open(file_path)
            pdf_meta = doc.metadata or {}
            doc.close()
            meta_dict = {k: str(v) for k, v in pdf_meta.items() if v}

            producer = (pdf_meta.get("producer") or "").lower()
            creator = (pdf_meta.get("creator") or "").lower()

            for sig in EDITING_SOFTWARE_SIGNATURES:
                if sig in producer or sig in creator:
                    detected_software = sig.capitalize()
                    software_tampering = True
                    anomalies.append(f"PDF was generated/modified by editing software: {detected_software}")
                    break
        except Exception as e:
            anomalies.append(f"PDF parsing notice: {e}")
    else:
        # Image EXIF analysis via Pillow
        try:
            img = Image.open(file_path)
            exif_raw = img._getexif()
            if exif_raw:
                for tag_id, val in exif_raw.items():
                    tag_name = TAGS.get(tag_id, str(tag_id))
                    meta_dict[tag_name] = str(val)

                software = (meta_dict.get("Software") or "").lower()
                for sig in EDITING_SOFTWARE_SIGNATURES:
                    if sig in software:
                        detected_software = sig.capitalize()
                        software_tampering = True
                        anomalies.append(f"EXIF Software tag reveals editing software: {detected_software}")
                        break
        except Exception:
            pass

    if not software_tampering and not anomalies:
        anomalies.append("No prohibited editing software traces found in metadata")

    return {
        "status": "FLAGGED" if software_tampering else "PASS",
        "software_tampering": software_tampering,
        "detected_software": detected_software or "Camera Hardware Stream",
        "anomalies": anomalies,
        "metadata_fields": meta_dict
    }