from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    JWT_SECRET: str = "pramaanx-secret-key-change-in-production"
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 5000
    AI_SERVICE_URL: str = "http://127.0.0.1:3001"
    GEMINI_API_KEY: str = ""
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    WORKSTATION_ID: str = "WS-CHK-01"
    CHECKPOINT_ID: str = "CHK-JALP-01"
    DEMO_MODE: bool = False
    RETENTION_MODE: str = "ZERO_RETENTION"
    ENABLE_CLOUD_SYNC: bool = False
    ENABLE_AI_OPINION: bool = True
    RISK_RULES_VERSION: str = "PRAMAANX-RISK-1.0"
    OCR_MODEL_VERSION: str = "PP-OCRv4"
    FACE_MODEL_VERSION: str = "AdaFace-ir18"
    LIVENESS_MODEL_VERSION: str = "Silence-FAS-v1.0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
