def validate_document(document_type: str, extracted: dict) -> dict:
    return {
        "status": "PASS",
        "rules_version": "rules-v1.0.0",
        "checks": [],
    }