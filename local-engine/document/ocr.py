def extract_text(image_path: str) -> dict:
    return {
        "text": "Sample OCR text",
        "confidence": 90.0,
        "engine": "PaddleOCR",
    }