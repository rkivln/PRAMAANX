"""
PRAMAANX — Cross-Stream Validator

Implements 8-point cross-stream consistency validation.
Each check compares two independent evidence streams.
"""

from typing import Any, Dict, List, Optional


class CrossStreamValidator:
    """8-point cross-stream consistency validator."""

    def __init__(self):
        self.version = "cross-stream-v1.0.0"
        self.checks = [
            self._check_01_dob_consistency,
            self._check_02_docnum_consistency,
            self._check_03_name_consistency,
            self._check_04_nationality_consistency,
            self._check_05_face_document_match,
            self._check_06_document_registry_match,
            self._check_07_stamp_registry_match,
            self._check_08_blacklist_check,
        ]

    def validate(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run all 8 cross-stream checks.
        
        Args:
            evidence: Combined evidence from all streams
            
        Returns:
            CrossStreamResult with all checks and summary
        """
        results = []
        for check_fn in self.checks:
            try:
                result = check_fn(evidence)
                results.append(result)
            except Exception as e:
                results.append({
                    "check_id": "UNKNOWN",
                    "name": "Unknown Check",
                    "status": "ERROR",
                    "severity": "LOW",
                    "confidence": 0.0,
                    "reason": f"Check execution error: {str(e)}",
                })

        mismatch_count = sum(1 for r in results if r.get("status") == "MISMATCH")
        uncertain_count = sum(1 for r in results if r.get("status") == "UNCERTAIN")
        critical_count = sum(1 for r in results if r.get("severity") == "CRITICAL")

        return {
            "checks": results,
            "mismatch_count": mismatch_count,
            "uncertain_count": uncertain_count,
            "critical_count": critical_count,
            "overall_status": self._compute_overall_status(results),
            "validator_version": self.version,
        }

    def _check_01_dob_consistency(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """CV-01: OCR DOB vs MRZ DOB."""
        ocr = evidence.get("ocr", {})
        mrz = evidence.get("mrz", {})
        
        ocr_dob = ocr.get("date_of_birth", "")
        mrz_dob = mrz.get("fields", {}).get("dob", "")
        
        if not ocr_dob and not mrz_dob:
            return {
                "check_id": "CV-01",
                "name": "DOB consistency",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "Neither OCR nor MRZ provided DOB",
            }
        
        if not mrz_dob:
            return {
                "check_id": "CV-01",
                "name": "DOB consistency",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "MRZ DOB not available",
            }
        
        # Normalize for comparison
        ocr_norm = ocr_dob.replace("/", "").replace("-", "").strip()
        mrz_norm = mrz_dob.replace("/", "").replace("-", "").strip()
        
        if ocr_norm == mrz_norm:
            return {
                "check_id": "CV-01",
                "name": "DOB consistency",
                "status": "PASS",
                "severity": "LOW",
                "confidence": 0.95,
                "reason": "OCR DOB matches MRZ DOB",
            }
        
        return {
            "check_id": "CV-01",
            "name": "DOB consistency",
            "status": "MISMATCH",
            "severity": "HIGH",
            "confidence": 0.9,
            "reason": f"OCR DOB ({ocr_dob}) differs from MRZ DOB ({mrz_dob})",
        }

    def _check_02_docnum_consistency(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """CV-02: OCR document number vs MRZ document number."""
        ocr = evidence.get("ocr", {})
        mrz = evidence.get("mrz", {})
        
        ocr_docnum = ocr.get("document_number", "").replace(" ", "").upper()
        mrz_docnum = mrz.get("fields", {}).get("document_number", "").replace(" ", "").upper()
        
        if not ocr_docnum and not mrz_docnum:
            return {
                "check_id": "CV-02",
                "name": "Document number consistency",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "No document number available",
            }
        
        if not mrz_docnum:
            return {
                "check_id": "CV-02",
                "name": "Document number consistency",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "MRZ document number not available",
            }
        
        if ocr_docnum == mrz_docnum:
            return {
                "check_id": "CV-02",
                "name": "Document number consistency",
                "status": "PASS",
                "severity": "LOW",
                "confidence": 0.95,
                "reason": "OCR document number matches MRZ",
            }
        
        return {
            "check_id": "CV-02",
            "name": "Document number consistency",
            "status": "MISMATCH",
            "severity": "HIGH",
            "confidence": 0.9,
            "reason": f"OCR doc num ({ocr_docnum}) differs from MRZ ({mrz_docnum})",
        }

    def _check_03_name_consistency(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """CV-03: OCR name vs MRZ name."""
        ocr = evidence.get("ocr", {})
        mrz = evidence.get("mrz", {})
        
        ocr_name = ocr.get("name", "").upper().replace(",", "").replace(" ", "")
        mrz_name = mrz.get("fields", {}).get("name", "").upper().replace(",", "").replace(" ", "")
        
        if not ocr_name and not mrz_name:
            return {
                "check_id": "CV-03",
                "name": "Name consistency",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "No name available",
            }
        
        if not mrz_name:
            return {
                "check_id": "CV-03",
                "name": "Name consistency",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "MRZ name not available",
            }
        
        # Fuzzy match for names
        similarity = self._name_similarity(ocr_name, mrz_name)
        
        if similarity > 0.85:
            return {
                "check_id": "CV-03",
                "name": "Name consistency",
                "status": "PASS",
                "severity": "LOW",
                "confidence": similarity,
                "reason": "Names match with high confidence",
            }
        
        if similarity > 0.6:
            return {
                "check_id": "CV-03",
                "name": "Name consistency",
                "status": "UNCERTAIN",
                "severity": "MEDIUM",
                "confidence": similarity,
                "reason": f"Partial name match (similarity: {similarity:.2f})",
            }
        
        return {
            "check_id": "CV-03",
            "name": "Name consistency",
            "status": "MISMATCH",
            "severity": "HIGH",
            "confidence": 1.0 - similarity,
            "reason": f"Names do not match: OCR='{ocr_name}' MRZ='{mrz_name}'",
        }

    def _check_04_nationality_consistency(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """CV-04: OCR nationality vs MRZ nationality."""
        ocr = evidence.get("ocr", {})
        mrz = evidence.get("mrz", {})
        
        ocr_nat = ocr.get("nationality", "").upper()
        mrz_nat = mrz.get("fields", {}).get("nationality", "").upper()
        
        if not ocr_nat and not mrz_nat:
            return {
                "check_id": "CV-04",
                "name": "Nationality consistency",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "No nationality data available",
            }
        
        if ocr_nat == mrz_nat:
            return {
                "check_id": "CV-04",
                "name": "Nationality consistency",
                "status": "PASS",
                "severity": "LOW",
                "confidence": 0.9,
                "reason": "Nationalities match",
            }
        
        return {
            "check_id": "CV-04",
            "name": "Nationality consistency",
            "status": "MISMATCH",
            "severity": "MEDIUM",
            "confidence": 0.8,
            "reason": f"Nationality mismatch: OCR='{ocr_nat}' MRZ='{mrz_nat}'",
        }

    def _check_05_face_document_match(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """CV-05: Document photo vs live face."""
        biometric = evidence.get("biometric", {})
        similarity = biometric.get("face_similarity_score", 0.0)
        
        if similarity is None:
            return {
                "check_id": "CV-05",
                "name": "Face-document match",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "Biometric comparison not performed",
            }
        
        if similarity >= 0.8:
            return {
                "check_id": "CV-05",
                "name": "Face-document match",
                "status": "PASS",
                "severity": "LOW",
                "confidence": similarity,
                "reason": f"Face similarity {similarity:.2f} exceeds threshold",
            }
        
        if similarity >= 0.6:
            return {
                "check_id": "CV-05",
                "name": "Face-document match",
                "status": "UNCERTAIN",
                "severity": "MEDIUM",
                "confidence": similarity,
                "reason": f"Borderline face similarity: {similarity:.2f}",
            }
        
        return {
            "check_id": "CV-05",
            "name": "Face-document match",
            "status": "MISMATCH",
            "severity": "HIGH",
            "confidence": 1.0 - similarity,
            "reason": f"Face similarity too low: {similarity:.2f}",
        }

    def _check_06_document_registry_match(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """CV-06: Document type vs template/registry."""
        document = evidence.get("document", {})
        registry = evidence.get("registry", {})
        
        doc_type = document.get("document_type", "")
        registry_match = registry.get("document_template_match", "NOT_AVAILABLE")
        
        if registry_match == "NOT_AVAILABLE":
            return {
                "check_id": "CV-06",
                "name": "Document-template registry match",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "Registry lookup not performed",
            }
        
        if registry_match == "MATCH":
            return {
                "check_id": "CV-06",
                "name": "Document-template registry match",
                "status": "PASS",
                "severity": "LOW",
                "confidence": 0.9,
                "reason": "Document matches authorized template",
            }
        
        return {
            "check_id": "CV-06",
            "name": "Document-template registry match",
            "status": "MISMATCH",
            "severity": "HIGH",
            "confidence": 0.85,
            "reason": "Document does not match any authorized template",
        }

    def _check_07_stamp_registry_match(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """CV-07: Stamp/signature vs authorized reference."""
        document = evidence.get("document", {})
        stamp_status = document.get("stamp_status", "NOT_AVAILABLE")
        
        if stamp_status == "NOT_AVAILABLE":
            return {
                "check_id": "CV-07",
                "name": "Stamp-registry match",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "Stamp verification not performed",
            }
        
        if stamp_status == "PASS":
            return {
                "check_id": "CV-07",
                "name": "Stamp-registry match",
                "status": "PASS",
                "severity": "LOW",
                "confidence": 0.9,
                "reason": "Stamp matches authorized reference",
            }
        
        return {
            "check_id": "CV-07",
            "name": "Stamp-registry match",
            "status": "MISMATCH",
            "severity": "HIGH",
            "confidence": 0.85,
            "reason": "Stamp does not match authorized reference",
        }

    def _check_08_blacklist_check(self, evidence: Dict[str, Any]) -> Dict[str, Any]:
        """CV-08: Identity history or blacklist result."""
        registry = evidence.get("registry", {})
        blacklist = registry.get("blacklist_check", "NOT_AVAILABLE")
        
        if blacklist == "NOT_AVAILABLE":
            return {
                "check_id": "CV-08",
                "name": "Blacklist/watchlist check",
                "status": "NOT_AVAILABLE",
                "severity": "LOW",
                "confidence": 0.0,
                "reason": "Blacklist check not performed",
            }
        
        if blacklist == "CLEAN":
            return {
                "check_id": "CV-08",
                "name": "Blacklist/watchlist check",
                "status": "PASS",
                "severity": "LOW",
                "confidence": 0.95,
                "reason": "No blacklist/watchlist matches found",
            }
        
        return {
            "check_id": "CV-08",
            "name": "Blacklist/watchlist check",
            "status": "MISMATCH",
            "severity": "CRITICAL",
            "confidence": 0.99,
            "reason": "Blacklist/watchlist match detected",
        }

    def _name_similarity(self, a: str, b: str) -> float:
        """Calculate simple name similarity (0.0 to 1.0)."""
        if not a or not b:
            return 0.0
        if a == b:
            return 1.0
        
        # Simple Jaccard similarity on characters
        set_a = set(a)
        set_b = set(b)
        intersection = len(set_a & set_b)
        union = len(set_a | set_b)
        
        if union == 0:
            return 0.0
        return intersection / union

    def _compute_overall_status(self, results: List[Dict[str, Any]]) -> str:
        """Compute overall status from individual checks."""
        statuses = [r.get("status", "NOT_AVAILABLE") for r in results]
        
        if "MISMATCH" in statuses:
            severities = [r.get("severity", "LOW") for r in results if r.get("status") == "MISMATCH"]
            if "CRITICAL" in severities:
                return "CRITICAL_MISMATCH"
            return "MISMATCH"
        
        if "UNCERTAIN" in statuses:
            return "UNCERTAIN"
        
        if all(s == "PASS" or s == "NOT_AVAILABLE" for s in statuses):
            return "PASS"
        
        return "INCONCLUSIVE"
