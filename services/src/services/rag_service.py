from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from qdrant_client.models import Filter, FieldCondition, MatchValue

from src.clients.gemini_client import gemini_service
from src.clients.qdrant_client import qdrant_service
from src.utils.config import settings
from src.utils.logger import logger


class RAGService:
    def __init__(self):
        self.vector_store = QdrantVectorStore(
            client=qdrant_service.client,
            collection_name=settings.QDRANT_COLLECTION,
            embedding=gemini_service.embedding_model,
        )

    def retrieve(
        self,
        document_id: str,
        question: str,
        limit: int = 5,
        score_threshold: float = 0.4,
    ) -> list[Document]:
        """
        Retrieve relevant chunks for a document using a relevance score threshold.
        """

        logger.info(f"Searching Qdrant for document {document_id}")

        results = self.vector_store.similarity_search_with_relevance_scores(
            query=question,
            k=limit,
            score_threshold=score_threshold,
            filter=Filter(
                must=[
                    FieldCondition(
                        key="metadata.document_id",
                        match=MatchValue(value=document_id),
                    )
                ]
            ),
        )

        documents = [doc for doc, score in results]

        logger.info(
            f"Retrieved {len(documents)} chunks with score >= {score_threshold}"
        )

        return documents


_rag_service = None


def get_rag_service():
    global _rag_service

    if _rag_service is None:
        _rag_service = RAGService()

    return _rag_service