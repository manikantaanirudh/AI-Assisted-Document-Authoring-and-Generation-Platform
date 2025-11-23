from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database (provide safe default; can be overridden via env)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/document_platform"

    # JWT (defaults allow local startup without env configuration)
    JWT_SECRET: str = "dev-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # LLM
    LLM_PROVIDER: str = "gemini"  # openai or gemini
    # Make API keys optional so app can start without them (LLM features will error gracefully if missing)
    LLM_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Application
    EXPORT_TMP_DIR: str = "./exports"
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

# Fallback: if provider is gemini and GEMINI_API_KEY empty, use LLM_API_KEY (legacy naming)
if settings.LLM_PROVIDER.lower() == "gemini" and not settings.GEMINI_API_KEY and settings.LLM_API_KEY:
    settings.GEMINI_API_KEY = settings.LLM_API_KEY

