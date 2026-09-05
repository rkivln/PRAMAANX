def parse_mrz(image_path: str) -> dict:
    return {
        "status": "PASS",
        "lines": [],
        "engine": "MRZ Parser",
    }