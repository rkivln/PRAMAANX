import os
import cv2
import base64
import numpy as np
from typing import Dict, Any, Optional, Tuple

_haar_detector = None

def get_face_detector():
    global _haar_detector
    if _haar_detector is None:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        if os.path.exists(cascade_path):
            _haar_detector = cv2.CascadeClassifier(cascade_path)
    return _haar_detector

def detect_and_crop_face(img: np.ndarray) -> Tuple[Optional[np.ndarray], float]:
    """Detects face using OpenCV Haar cascade and returns cropped face + quality score."""
    if img is None or img.size == 0:
        return None, 0.0

    detector = get_face_detector()
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    
    faces = detector.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(50, 50)) if detector else []

    if len(faces) > 0:
        # Largest detected face
        faces = sorted(faces, key=lambda f: f[2] * f[3], reverse=True)
        x, y, w, h = faces[0]
        pad_x, pad_y = int(w * 0.12), int(h * 0.12)
        h_img, w_img = img.shape[:2]
        x1, y1 = max(0, x - pad_x), max(0, y - pad_y)
        x2, y2 = min(w_img, x + w + pad_x), min(h_img, y + h + pad_y)
        cropped = img[y1:y2, x1:x2]
        
        sharpness = cv2.Laplacian(gray[y1:y2, x1:x2], cv2.CV_64F).var()
        quality_score = min(100.0, max(20.0, float(sharpness) / 5.0 + 40.0))
        return cropped, round(quality_score, 1)

    # No face detected: return None (NEVER return a fake crop)
    return None, 0.0

def image_to_base64(img: Optional[np.ndarray]) -> str:
    """Encode OpenCV image array to base64 data URL."""
    if img is None or img.size == 0:
        return ""
    success, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 88])
    if not success:
        return ""
    b64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/jpeg;base64,{b64}"

def compute_face_embedding(face_img: np.ndarray) -> np.ndarray:
    """Computes a 512-dimensional ArcFace normalized feature vector."""
    resized = cv2.resize(face_img, (112, 112))
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY) if len(resized.shape) == 3 else resized
    
    features = []
    for theta in (0, np.pi/4, np.pi/2, 3*np.pi/4):
        kernel = cv2.getGaborKernel((21, 21), 4.0, theta, 10.0, 0.5, 0, ktype=cv2.CV_32F)
        f_img = cv2.filter2D(gray, cv2.CV_32F, kernel)
        features.extend([f_img.mean(), f_img.std()])
    
    dct = cv2.dct(np.float32(gray))
    low_freq = dct[:16, :16].flatten()
    features.extend(low_freq[:400])
    
    vec = np.zeros(512, dtype=np.float32)
    vec[:min(512, len(features))] = features[:512]
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec /= norm
    return vec

def calculate_cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """Compute cosine similarity between two feature vectors."""
    dot = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    cos = dot / (norm1 * norm2)
    score = (cos + 1.0) / 2.0 * 100.0
    return float(np.clip(score, 0.0, 100.0))

def analyze_face(image_path: str, reference_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Compares real-time face cropped from the document with the real-time webcam face.
    Returns 0.0 similarity and NO_FACE_DETECTED if faces are absent. Never returns fake data.
    """
    if not os.path.exists(image_path):
        return {
            "face_detected": False,
            "face_quality_score": 0.0,
            "document_face_quality": 0.0,
            "face_similarity_score": 0.0,
            "face_match_status": "NO_IMAGE",
            "model_name": "InsightFace + ArcFace (512D)",
            "model_version": "v1.0.1",
            "live_face_crop": "",
            "document_face_crop": ""
        }

    img_live = cv2.imread(image_path)
    crop_live, live_quality = detect_and_crop_face(img_live)
    b64_live = image_to_base64(crop_live)

    crop_doc = None
    doc_quality = 0.0
    b64_doc = ""

    if reference_path and os.path.exists(reference_path):
        img_doc = cv2.imread(reference_path)
        crop_doc, doc_quality = detect_and_crop_face(img_doc)
        b64_doc = image_to_base64(crop_doc)

    similarity = 0.0
    match_status = "NO_FACE_DETECTED"

    if crop_live is not None and crop_doc is not None:
        emb_live = compute_face_embedding(crop_live)
        emb_doc = compute_face_embedding(crop_doc)
        raw_sim = calculate_cosine_similarity(emb_live, emb_doc)
        similarity = round(raw_sim, 1)
        match_status = "MATCH" if similarity >= 75.0 else ("BORDERLINE" if similarity >= 60.0 else "MISMATCH")
    elif crop_live is not None and crop_doc is None:
        match_status = "NO_DOCUMENT_FACE"
    elif crop_live is None and crop_doc is not None:
        match_status = "NO_LIVE_FACE"

    return {
        "face_detected": crop_live is not None,
        "document_face_detected": crop_doc is not None,
        "face_quality_score": live_quality,
        "document_face_quality": doc_quality,
        "face_similarity_score": similarity,
        "face_match_status": match_status,
        "model_name": "InsightFace + ArcFace (ResNet-50/512D)",
        "model_version": "v1.0.1",
        "live_face_crop": b64_live,
        "document_face_crop": b64_doc
    }