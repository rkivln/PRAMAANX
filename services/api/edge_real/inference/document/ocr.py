"""
PRAMAANX — OCR Engine Interface

PP-OCRv4 interface for document text extraction.
Supports required document languages.
Stores field name, raw value, normalized value, confidence, bounding box.
"""

from typing import Any, Dict, List, Optional
import cv2
import numpy as np


class OCREngine:
    """PP-OCRv4 OCR engine wrapper."""

    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path
        self.model_name = "PP-OCRv4"
        self.model_version = "v4.0.0"
        self._loaded = False

    def load(self) -> None:
        """Load OCR models. Placeholder for actual PP-OCRv4 integration."""
        self._loaded = True

    def is_loaded(self) -> bool:
        return self._loaded

    def extract(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Extract structured text from document image.
        
        Returns:
            OCRResult with fields, confidence, bounding boxes
        """
        if not self._loaded:
            self.load()

        # Placeholder: real implementation calls PP-OCRv4
        # This returns a structured result indicating the engine is available
        return {
            "engine": self.model_name,
            "version": self.model_version,
            "status": "AVAILABLE",
            "fields": [],
            "raw_text": "",
            "confidence": 0.0,
            "processing_time_ms": 0.0,
        }

    def extract_fields(self, image: np.ndarray, field_names: List[str]) -> Dict[str, Any]:
        """
        Extract specific fields from document image.
        
        Args:
            image: Document image as numpy array
            field_names: List of field names to extract
            
        Returns:
            Dict mapping field names to {value, confidence, bbox}
        """
        result = self.extract(image)
        fields = {}
        for name in field_names:
            fields[name] = {
                "raw_value": "",
                "normalized_value": "",
                "confidence": 0.0,
                "bounding_box": None,
            }
        return {
            "engine": self.model_name,
            "version": self.model_version,
            "fields": fields,
            "status": "AVAILABLE",
        }
