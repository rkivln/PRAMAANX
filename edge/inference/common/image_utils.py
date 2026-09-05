"""
PRAMAANX — Image Utilities

Secure image loading and handling for edge inference.
"""

from typing import Optional
import cv2
import numpy as np
import os


def load_image(path: str) -> Optional[np.ndarray]:
    """
    Load image from path securely.
    
    Args:
        path: File path to image
        
    Returns:
        Image as numpy array (BGR format) or None if load fails
    """
    if not os.path.exists(path):
        return None
    try:
        image = cv2.imread(path, cv2.IMREAD_COLOR)
        return image
    except Exception:
        return None


def save_temp_image(image: np.ndarray, prefix: str = "pramaanx_") -> str:
    """
    Save image to secure temp directory with generated filename.
    
    CRITICAL: Never use user-provided filenames directly.
    Generated filenames only.
    
    Args:
        image: Image to save
        prefix: Filename prefix
        
    Returns:
        Path to saved temp file
    """
    import tempfile
    import uuid
    
    fd, path = tempfile.mkstemp(suffix=".jpg", prefix=prefix)
    try:
        cv2.imwrite(path, image, [cv2.IMWRITE_JPEG_QUALITY, 95])
    finally:
        os.close(fd)
    
    return path


def secure_delete_path(path: str) -> None:
    """
    Securely delete file at path.
    
    Overwrites with zeros before deletion.
    """
    if not os.path.exists(path):
        return
    
    try:
        size = os.path.getsize(path)
        with open(path, "r+b") as f:
            f.seek(0)
            f.write(b"\x00" * size)
            f.flush()
            os.fsync(f.fileno())
    except Exception:
        pass
    
    try:
        os.remove(path)
    except Exception:
        pass
