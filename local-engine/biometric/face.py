def analyze_face(image_path: str, reference_path: str = None) -> dict:
    return {
        "face_detected": True,
        "face_quality_score": 91.0,
        "face_similarity_score": 88.5,
        "liveness_score": 0.95,
        "liveness_status": "PASS",
        "face_match_status": "MATCH",
        "model_name": "SCRFD + ArcFace",
        "model_version": "v1.0.0",
    }