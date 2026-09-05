"""
PRAMAANX — Document Inference Module

Provides local document processing:
- OCR extraction (PP-OCRv4 interface)
- MRZ parsing and validation (ICAO 9303)
- Document type detection
- Signature verification interface
- Stamp/emblem matching interface

All processing is local. No images or embeddings are transmitted externally.
"""

from .ocr import OCREngine
from .mrz import MRZParser
from .rules import DocumentRulesEngine

__all__ = ["OCREngine", "MRZParser", "DocumentRulesEngine"]
