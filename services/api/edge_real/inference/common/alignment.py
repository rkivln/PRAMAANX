"""
PRAMAANX — Alignment Utilities

Umeyama alignment and related transformations.
"""

from typing import List, Tuple
import numpy as np


def umeyama_alignment(
    src: List[Tuple[float, float]],
    dst: List[Tuple[float, float]],
    estimate_scale: bool = True,
) -> np.ndarray:
    """
    Compute Umeyama similarity transform.
    
    Args:
        src: Source points
        dst: Destination points
        estimate_scale: Whether to estimate scale factor
        
    Returns:
        2x3 affine transformation matrix
    """
    src = np.array(src, dtype=np.float32)
    dst = np.array(dst, dtype=np.float32)
    
    num_points = src.shape[0]
    if num_points < 2:
        return np.eye(2, 3, dtype=np.float32)
    
    src_mean = src.mean(axis=0)
    dst_mean = dst.mean(axis=0)
    
    src_centered = src - src_mean
    dst_centered = dst - dst_mean
    
    cov = src_centered.T @ dst_centered
    u, s, vt = np.linalg.svd(cov)
    
    r = vt.T @ u.T
    if np.linalg.det(r) < 0:
        vt[-1, :] *= -1
        r = vt.T @ u.T
    
    if estimate_scale:
        scale = np.sum(s) / np.sum(src_centered ** 2)
    else:
        scale = 1.0
    
    t = dst_mean - scale * r @ src_mean
    
    transform = np.zeros((2, 3), dtype=np.float32)
    transform[:2, :2] = scale * r
    transform[:, 2] = t
    
    return transform
