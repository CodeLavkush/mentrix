from uuid import uuid4

from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore

from clients.gemini_client import gemini_service
from clients.qdrant_client import qdrant_service
from utils.config import settings
from utils.logger import logger


class EmbeddingService:
    def __init__(self):
        qdrant_service.create_collection()

        self.vector_store = QdrantVectorStore(
            client=qdrant_service.client,
            collection_name=settings.QDRANT_COLLECTION,
            embedding=gemini_service.embedding_model,
        )

    def store_document(
        self,
        documents: list[Document],
    ) -> None:
        """
        Generate embeddings and store them in Qdrant.
        """

        if not documents:
            logger.warning("No chunks available for embedding.")
            return

        logger.info(
            f"Generating embeddings for {len(documents)} chunks..."
        )

        ids = [str(uuid4()) for _ in documents]

        self.vector_store.add_documents(
            documents=documents,
            ids=ids,
        )

        logger.info("Embeddings stored successfully.")

    def delete_document(
        self,
        document_id: str,
    ) -> None:
        """
        Delete all vectors belonging to a document.
        """

        logger.info(f"Deleting vectors for {document_id}")

        qdrant_service.client.delete(
            collection_name=settings.QDRANT_COLLECTION,
            points_selector={
                "filter": {
                    "must": [
                        {
                            "key": "document_id",
                            "match": {
                                "value": document_id
                            },
                        }
                    ]
                }
            },
        )

        logger.info("Vectors deleted successfully.")


embedding_service = EmbeddingService()