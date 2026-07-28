from ..client.qdrant_client import vector_store
from ..services.callback import callback_service
from ..services.chunking_service import ChunkingService
from ..services.document_processor import DocumentProcessor
from ..services.rag_service import RAGService
from ..utils.logger import logger


def process_document(
    document_id: str,
    user_id: str,
    storage_path: str,
):
    """
    Process a document.

    Pipeline:

    Download PDF
        ↓
    Detect OCR
        ↓
    Extract Text
        ↓
    Chunk
        ↓
    Generate Embeddings
        ↓
    Store in Qdrant
        ↓
    Notify Backend
    """

    logger.info(
        "Processing document %s",
        document_id,
    )

    processor = DocumentProcessor(
        document_id=document_id,
        user_id=user_id,
        storage_path=storage_path,
    )

    try:
        # -----------------------------
        # Load Document
        # -----------------------------
        documents = processor.load()

        logger.info(
            "Loaded %d pages",
            len(documents),
        )

        # -----------------------------
        # Chunking
        # -----------------------------
        chunking_service = ChunkingService()

        chunks = chunking_service.split(documents)

        logger.info(
            "Generated %d chunks",
            len(chunks),
        )

        # -----------------------------
        # Store in Qdrant
        # -----------------------------
        vector_store.add_documents(chunks)

        logger.info(
            "Stored embeddings in Qdrant"
        )

        # -----------------------------
        # Notify Backend
        # -----------------------------
        callback_service.update_document_status(
            document_id=document_id,
            status="READY",
        )

        logger.info(
            "Document %s processed successfully",
            document_id,
        )

        return {
            "status": "READY",
            "documentId": document_id,
            "chunks": len(chunks),
        }

    except Exception as e:

        logger.exception(
            "Document processing failed"
        )

        try:
            callback_service.update_document_status(
                document_id=document_id,
                status="FAILED",
                error=str(e),
            )
        except Exception:
            logger.exception(
                "Failed to notify backend"
            )

        raise

    finally:
        processor.cleanup()


def process_query(
    query: str,
    document_id: str,
    user_id: str,
):
    """
    Execute a Retrieval-Augmented Generation query.
    """

    logger.info(
        "Processing query for document %s",
        document_id,
    )

    rag = RAGService()

    response = rag.ask(
        query=query,
        user_id=user_id,
        document_id=document_id,
    )

    logger.info(
        "Query completed"
    )

    return {
        "answer": response,
    }