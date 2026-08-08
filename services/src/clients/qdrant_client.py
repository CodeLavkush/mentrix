from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    Filter,
    FieldCondition,
    MatchValue,
)

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
                size=3072,
                distance=Distance.COSINE,
            ),
        )

    def get_document_chunks(
        self,
        document_id: str,
    ) -> list[str]:

        logger.info(
            f"Fetching chunks for document: {document_id}"
        )

        document_filter = Filter(
            must=[
                FieldCondition(
                    key="metadata.document_id",
                    match=MatchValue(
                        value=document_id,
                    ),
                )
            ]
        )

        chunks: list[tuple[int, str]] = []

        offset = None

        while True:
            records, next_offset = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=document_filter,
                limit=100,
                offset=offset,
                with_payload=True,
                with_vectors=False,
            )

            for record in records:
                payload = record.payload or {}

                page_content = payload.get("page_content")
                metadata = payload.get("metadata") or {}

                if not page_content:
                    continue

                chunk_index = metadata.get(
                    "chunk_index",
                    0,
                )

                chunks.append(
                    (
                        chunk_index,
                        page_content,
                    )
                )

            if next_offset is None:
                break

            offset = next_offset

        # Restore original document order
        chunks.sort(key=lambda item: item[0])

        result = [
            content
            for _, content in chunks
        ]

        logger.info(
            f"Retrieved {len(result)} chunks "
            f"for document: {document_id}"
        )

        return result

    def delete_document(
        self,
        document_id: str,
    ) -> None:

        logger.info(
            f"Deleting vectors for {document_id}"
        )

        self.client.delete(
            collection_name=self.collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(
                        key="metadata.document_id",
                        match=MatchValue(
                            value=document_id,
                        ),
                    )
                ]
            ),
        )

        logger.info(
            "Vectors deleted successfully."
        )


qdrant_service = QdrantService()