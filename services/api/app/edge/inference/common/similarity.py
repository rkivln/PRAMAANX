"""
PRAMAANX — Similarity Utilities

Cosine similarity and distance metrics for embeddings.
"""

from typing import Optional
import numpy as np


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate cosine similarity between two vectors."""
    if a is None or b is None:
        return 0.0
    if a.shape != b.shape:
        return 0.0
    dot = float(np.dot(a, b))
    norm_a = float(np.linalg.norm(a))
    norm_b = float(np.linalg.norm(b))
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return dot / (norm_a * norm_b)


def euclidean_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Calculate Euclidean distance between two vectors."""
    if a is None or b is None:
        return float("inf")
    if a.shape != b.shape:
        return float("inf")
    return float(np.linalg.norm(a - b))
