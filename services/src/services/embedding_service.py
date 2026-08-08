from uuid import uuid4
import time

from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore

from src.clients.gemini_client import gemini_service
from src.clients.qdrant_client import qdrant_service
from src.utils.config import settings
from src.utils.logger import logger


class EmbeddingService:

    def __init__(self):
        qdrant_service.create_collection()

        self.vector_store = QdrantVectorStore(
            client=qdrant_service.client,
            collection_name=settings.QDRANT_COLLECTION,
            embedding=gemini_service.embedding_model,
        )

        # Maximum chunks sent in one Gemini embedding request
        self.batch_size = 10

    def store_document(
        self,
        documents: list[Document],
    ) -> None:

        if not documents:
            logger.warning(
                "No chunks available for embedding."
            )
            return

        total = len(documents)

        logger.info(
            f"Embedding {total} chunks..."
        )

        for start in range(
            0,
            total,
            self.batch_size,
        ):
            end = min(
                start + self.batch_size,
                total,
            )

            batch = documents[start:end]

            ids = [
                str(uuid4())
                for _ in batch
            ]

            while True:
                try:
                    logger.info(
                        f"Embedding batch "
                        f"{start + 1}-{end} of {total}"
                    )

                    self.vector_store.add_documents(
                        documents=batch,
                        ids=ids,
                    )

                    break

                except Exception as e:

                    if "RESOURCE_EXHAUSTED" in str(e):
                        logger.warning(
                            "Gemini quota exceeded. "
                            "Waiting 60 seconds..."
                        )

                        time.sleep(60)
                        continue

                    raise

            time.sleep(2)

        logger.info(
            "Embeddings stored successfully."
        )

    def delete_document(
        self,
        document_id: str,
    ) -> None:

        logger.info(
            f"Deleting vectors for document: {document_id}"
        )

        qdrant_service.client.delete(
            collection_name=settings.QDRANT_COLLECTION,
            points_selector={
                "filter": {
                    "must": [
                        {
                            "key": "metadata.document_id",
                            "match": {
                                "value": document_id,
                            },
                        }
                    ]
                }
            },
        )

        logger.info(
            f"Vectors deleted successfully for document: "
            f"{document_id}"
        )


embedding_service = EmbeddingService()