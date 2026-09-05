"""
PRAMAANX — MRZ Parser

ICAO 9303 MRZ parsing and validation.
Supports TD1, TD2, TD3 formats.
Validates check digits.

Does not treat checksum success as proof of authenticity.
The MRZ stream is one evidence stream.
"""

from typing import Any, Dict, Optional
import re


class MRZParser:
    """ICAO 9303 MRZ parser and validator."""

    def __init__(self):
        self.model_name = "ICAO9303"
        self.model_version = "v1.0.0"

    def parse(self, mrz_text: str) -> Dict[str, Any]:
        """
        Parse MRZ text and validate check digits.
        
        Args:
            mrz_text: Raw MRZ text from document
            
        Returns:
            MRZResult with parsed fields and check digit validation
        """
        if not mrz_text or not mrz_text.strip():
            return {
                "stream": "MRZ",
                "status": "NOT_AVAILABLE",
                "fields": {},
                "checksum": {"valid": False, "details": "No MRZ detected"},
            }

        lines = [line.strip() for line in mrz_text.strip().split("\n") if line.strip()]
        if len(lines) < 2:
            return {
                "stream": "MRZ",
                "status": "INVALID",
                "fields": {},
                "checksum": {"valid": False, "details": "Insufficient MRZ lines"},
            }

        # Detect format
        line1 = lines[0]
        if len(line1) >= 30:
            format_type = "TD3"  # Passport (2 lines, 44 chars each)
        elif len(lines) >= 3:
            format_type = "TD1"  # ID card (3 lines, 30 chars each)
        else:
            format_type = "TD2"  # Other (2 lines, 36 chars each)

        fields = {}
        checksum_results = {}

        try:
            if format_type == "TD3":
                fields, checksum_results = self._parse_td3(lines)
            elif format_type == "TD1":
                fields, checksum_results = self._parse_td1(lines)
            else:
                fields, checksum_results = self._parse_td2(lines)
        except Exception:
            return {
                "stream": "MRZ",
                "status": "INVALID",
                "fields": {},
                "checksum": {"valid": False, "details": "Parse error"},
            }

        all_valid = all(v.get("valid", False) for v in checksum_results.values())

        return {
            "stream": "MRZ",
            "status": "PASS" if all_valid else "FAIL",
            "format": format_type,
            "fields": fields,
            "checksum": {
                "valid": all_valid,
                "details": checksum_results,
            },
        }

    def _parse_td3(self, lines: list) -> tuple:
        """Parse TD3 (passport) format."""
        fields = {}
        checksums = {}

        line1 = lines[0].ljust(44, "<")
        line2 = lines[1].ljust(44, "<")

        # Line 1: P<country<<name<<<<...
        fields["document_type"] = line1[0:1]
        fields["issuing_country"] = line1[2:5].strip("<")
        fields["name"] = line1[5:].strip("<").replace("<", " ").strip()

        # Line 2: document_number, nationality, dob, sex, expiry, optional data
        doc_num = line2[0:9]
        fields["document_number"] = doc_num.strip("<")
        checksums["document_number"] = self._validate_check_digit(doc_num, 9)

        fields["nationality"] = line2[10:13].strip("<")
        fields["dob"] = line2[13:19]
        checksums["dob"] = self._validate_check_digit(line2[13:19], 6)

        fields["sex"] = line2[20]
        fields["expiry"] = line2[21:27]
        checksums["expiry"] = self._validate_check_digit(line2[21:27], 6)

        return fields, checksums

    def _parse_td1(self, lines: list) -> tuple:
        """Parse TD1 (ID card) format."""
        fields = {}
        checksums = {}

        line1 = lines[0].ljust(30, "<")
        line2 = lines[1].ljust(30, "<")
        line3 = lines[2].ljust(30, "<")

        fields["document_type"] = line1[0:2]
        fields["issuing_country"] = line1[2:5]
        fields["document_number"] = line1[5:14].strip("<")
        checksums["document_number"] = self._validate_check_digit(line1[5:14], 9)

        fields["dob"] = line2[0:6]
        checksums["dob"] = self._validate_check_digit(line2[0:6], 6)

        fields["sex"] = line2[7]
        fields["expiry"] = line2[8:14]
        checksums["expiry"] = self._validate_check_digit(line2[8:14], 6)

        fields["nationality"] = line2[15:18]
        fields["optional_data"] = line3[0:30]

        return fields, checksums

    def _parse_td2(self, lines: list) -> tuple:
        """Parse TD2 format."""
        fields = {}
        checksums = {}

        line1 = lines[0].ljust(36, "<")
        line2 = lines[1].ljust(36, "<")

        fields["document_type"] = line1[0:2]
        fields["issuing_country"] = line1[2:5]
        fields["name"] = line1[5:].strip("<").replace("<", " ").strip()

        fields["document_number"] = line2[0:9].strip("<")
        checksums["document_number"] = self._validate_check_digit(line2[0:9], 9)

        fields["nationality"] = line2[10:13]
        fields["dob"] = line2[13:19]
        checksums["dob"] = self._validate_check_digit(line2[13:19], 6)

        fields["sex"] = line2[20]
        fields["expiry"] = line2[21:27]
        checksums["expiry"] = self._validate_check_digit(line2[21:27], 6)

        return fields, checksums

    def _validate_check_digit(self, data: str, expected_length: int) -> Dict[str, Any]:
        """Validate ICAO 9303 check digit."""
        if len(data) < expected_length:
            return {"valid": False, "reason": "Insufficient length"}

        # Extract check digit (last character for most fields)
        value = data[:expected_length - 1]
        check_char = data[expected_length - 1]

        if check_char == "<":
            return {"valid": True, "reason": "No check digit present"}

        try:
            expected = int(check_char)
            calculated = self._mod10(value)
            return {
                "valid": expected == calculated,
                "expected": str(expected),
                "calculated": str(calculated),
            }
        except ValueError:
            return {"valid": False, "reason": f"Invalid check digit character: {check_char}"}

    def _mod10(self, value: str) -> int:
        """Calculate ICAO 9303 Mod 10 check digit."""
        total = 0
        for i, char in enumerate(value):
            if char.isdigit():
                weight = 1 if i % 2 == 0 else 2
                product = int(char) * weight
                total += product if product < 10 else product - 9
            elif char == "<":
                weight = 1 if i % 2 == 0 else 2
                product = 0 * weight
                total += product
        return (10 - (total % 10)) % 10
