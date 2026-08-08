from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.chat import router as chat_router
from src.api.routes import router as document_router
from src.api.quiz import router as quiz_router
from src.clients.minio_client import minio_client
from src.clients.qdrant_client import qdrant_service
from src.utils.config import settings
from src.utils.logger import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME}...")

    try:
        minio_client.ensure_bucket()
        logger.info("MinIO bucket verified.")
    except Exception as e:
        logger.exception(f"Failed to initialize MinIO: {e}")

    try:
        qdrant_service.create_collection()
        logger.info("Qdrant collection verified.")
    except Exception as e:
        logger.exception(f"Failed to initialize Qdrant: {e}")

    yield

    logger.info("Shutting down AI Service...")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    document_router,
    prefix=settings.API_PREFIX,
    tags=["Document Processing"],
)

app.include_router(
    chat_router,
    prefix=settings.API_PREFIX,
    tags=["Chat"],
)

app.include_router(
    quiz_router,
    prefix=settings.API_PREFIX,
    tags=["Quiz"],
)


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": settings.APP_NAME,
        "status": "running",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
    }