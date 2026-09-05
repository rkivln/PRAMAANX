from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    JWT_SECRET: str = ""
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 5000
    AI_SERVICE_URL: str = "http://127.0.0.1:3001"
    GEMINI_API_KEY: str = ""
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    WORKSTATION_ID: str = "WS-CHK-01"
    DEMO_MODE: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
