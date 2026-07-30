from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore

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
    ) -> list[Document]:
        """
        Retrieve relevant chunks for a document.
        """

        logger.info(f"Searching Qdrant for document {document_id}")

        documents = self.vector_store.similarity_search(
            query=question,
            k=limit,
            filter={
                "document_id": document_id,
            },
        )

        logger.info(f"Retrieved {len(documents)} chunks.")

        return documents


_rag_service = None


def get_rag_service():
    global _rag_service

    if _rag_service is None:
        _rag_service = RAGService()

    return _rag_service