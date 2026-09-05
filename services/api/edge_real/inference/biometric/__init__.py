"""
PRAMAANX — Biometric Inference Module

Provides local biometric processing:
- Face detection (SCRFD)
- Face alignment (Umeyama)
- Face embedding (AdaFace 512-D)
- Face similarity calculation
- Liveness detection
- Face quality assessment

CRITICAL: No raw face images or embeddings leave this module.
"""

from .face import FaceEngine
from .liveness import LivenessEngine

__all__ = ["FaceEngine", "LivenessEngine"]
