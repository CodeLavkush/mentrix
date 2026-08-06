from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================
    # App
    # ==========================
    APP_NAME: str = "Mentrix AI Service"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"

    # ==========================
    # Gemini
    # ==========================
    GEMINI_API_KEY: str = Field(...)

    GEMINI_VISION_MODEL: str = Field(...)
    EMBEDDING_MODEL: str = Field(...)
    CHAT_MODEL: str = Field(...)

    # ==========================
    # OCR
    # ==========================
    OCR_MAX_WORKERS: int = 1

    # ==========================
    # Qdrant
    # ==========================
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "documents"

    # ==========================
    # MinIO
    # ==========================
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str
    MINIO_SECURE: bool = False
    
    # ==========================
    # Chunking
    # ==========================
    CHUNK_SIZE: int = 1500
    CHUNK_OVERLAP: int = 150

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()