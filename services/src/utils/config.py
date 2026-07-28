from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # -----------------------------
    # Application
    # -----------------------------
    APP_NAME: str = "Mentrix AI Service"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # -----------------------------
    # Gemini
    # -----------------------------
    GEMINI_API_KEY: str

    EMBEDDING_MODEL: str = "gemini-embedding-001"
    CHAT_MODEL: str = "gemini-2.5-flash"

    # -----------------------------
    # Redis
    # -----------------------------
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: str | None = None

    # -----------------------------
    # Qdrant
    # -----------------------------
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str | None = None
    QDRANT_COLLECTION: str = "mentrix"

    # -----------------------------
    # MinIO
    # -----------------------------
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str
    MINIO_SECURE: bool = False

    # -----------------------------
    # Node Backend
    # -----------------------------
    BACKEND_URL: str

    # -----------------------------
    # OCR
    # -----------------------------
    TESSERACT_CMD: str = "tesseract"

    # -----------------------------
    # Chunking
    # -----------------------------
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()