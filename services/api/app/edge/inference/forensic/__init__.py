"""
PRAMAANX — Forensic Inference Module

Provides local forensic analysis:
- Adaptive ELA (Error Level Analysis)
- JPEG/DQT quantization analysis
- Splice detection
- ORB feature analysis
- SSIM comparison
- EXIF/metadata analysis

Each engine produces evidence, not automatic guilt determination.
"""

from .ela import ELAEngine
from .metadata import MetadataEngine
from .splice import SpliceDetector

__all__ = ["ELAEngine", "MetadataEngine", "SpliceDetector"]
