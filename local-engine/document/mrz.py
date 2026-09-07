import re
import cv2
import numpy as np
from typing import Dict, Any, Optional, List
from mrz.checker.td1 import TD1CodeChecker
from mrz.checker.td2 import TD2CodeChecker
from mrz.checker.td3 import TD3CodeChecker

def find_mrz_lines(text: str) -> List[str]:
    """Find potential ICAO 9303 MRZ lines from raw text strings."""
    if not text:
        return []
    lines = [l.strip().replace(' ', '') for l in text.splitlines()]
    mrz_candidates = []
    for line in lines:
        cleaned = re.sub(r'[^A-Z0-9<]', '', line.upper())
        # TD3 lines are 44 chars, TD2 are 36 chars, TD1 are 30 chars
        if len(cleaned) >= 28 and ('<' in cleaned):
            mrz_candidates.append(cleaned)
    return mrz_candidates

def parse_mrz(image_path: str, raw_text: Optional[str] = None) -> Dict[str, Any]:
    """
    Extract and validate MRZ data from image or extracted text.
    Never returns mock, dummy, or cached data.
    """
    lines_found = []
    if raw_text:
        lines_found = find_mrz_lines(raw_text)

    # TD3 check (Passport: 2 lines of 44 characters)
    td3_lines = [l for l in lines_found if len(l) == 44]
    if len(td3_lines) >= 2:
        l1, l2 = td3_lines[0], td3_lines[1]
        try:
            checker = TD3CodeChecker(f"{l1}\n{l2}")
            fields = checker.fields()
            is_valid = bool(checker.result)
            return {
                "mrz_detected": True,
                "format": "TD3 (Passport)",
                "valid": is_valid,
                "raw_mrz": f"{l1}\n{l2}",
                "country_code": getattr(fields, 'country', None),
                "surname": getattr(fields, 'surname', None),
                "given_names": getattr(fields, 'name', None),
                "document_number": getattr(fields, 'document_number', None),
                "nationality": getattr(fields, 'nationality', None),
                "birth_date": getattr(fields, 'birth_date', None),
                "sex": getattr(fields, 'sex', None),
                "expiry_date": getattr(fields, 'expiry_date', None),
                "checksums": {
                    "document_number_valid": bool(checker.document_number_hash),
                    "dob_valid": bool(checker.birth_date_hash),
                    "expiry_valid": bool(checker.expiry_date_hash),
                    "composite_valid": bool(checker.final_hash)
                },
                "status": "PASS" if is_valid else "FLAGGED"
            }
        except Exception as e:
            print(f"[MRZ] TD3 parser notice: {e}")

    # TD1 check (National ID: 3 lines of 30 characters)
    td1_lines = [l for l in lines_found if len(l) == 30]
    if len(td1_lines) >= 3:
        l1, l2, l3 = td1_lines[0], td1_lines[1], td1_lines[2]
        try:
            checker = TD1CodeChecker(f"{l1}\n{l2}\n{l3}")
            fields = checker.fields()
            is_valid = bool(checker.result)
            return {
                "mrz_detected": True,
                "format": "TD1 (National ID Card)",
                "valid": is_valid,
                "raw_mrz": f"{l1}\n{l2}\n{l3}",
                "country_code": getattr(fields, 'country', None),
                "surname": getattr(fields, 'surname', None),
                "given_names": getattr(fields, 'name', None),
                "document_number": getattr(fields, 'document_number', None),
                "nationality": getattr(fields, 'nationality', None),
                "birth_date": getattr(fields, 'birth_date', None),
                "sex": getattr(fields, 'sex', None),
                "expiry_date": getattr(fields, 'expiry_date', None),
                "checksums": {
                    "document_number_valid": bool(checker.document_number_hash),
                    "dob_valid": bool(checker.birth_date_hash),
                    "expiry_valid": bool(checker.expiry_date_hash),
                    "composite_valid": bool(checker.final_hash)
                },
                "status": "PASS" if is_valid else "FLAGGED"
            }
        except Exception as e:
            print(f"[MRZ] TD1 parser notice: {e}")

    # If no real MRZ detected on the document, return clean empty result
    return {
        "mrz_detected": False,
        "format": "None Detected",
        "valid": False,
        "raw_mrz": "",
        "document_type": None,
        "country_code": None,
        "surname": None,
        "given_names": None,
        "document_number": None,
        "nationality": None,
        "birth_date": None,
        "sex": None,
        "expiry_date": None,
        "checksums": {
            "document_number_valid": False,
            "dob_valid": False,
            "expiry_valid": False,
            "composite_valid": False
        },
        "status": "NOT_DETECTED"
    }