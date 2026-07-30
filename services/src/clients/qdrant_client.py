from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

from src.utils.config import settings
from src.utils.logger import logger


class QdrantService:
    def __init__(self):
        self.client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
        )

        self.collection_name = settings.QDRANT_COLLECTION

    def create_collection(self):
        collections = self.client.get_collections().collections

        exists = any(
            c.name == self.collection_name
            for c in collections
        )

        if exists:
            return

        logger.info(
            f"Creating collection: {self.collection_name}"
        )

        self.client.create_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=3072,   # Gemini Embedding dimension
                distance=Distance.COSINE,
            ),
        )


qdrant_service = QdrantService()