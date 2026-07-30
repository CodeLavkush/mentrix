from fastapi import APIRouter, HTTPException

from src.models.schemas import ProcessDocumentRequest
from src.services.chunking_service import chunking_service
from src.services.document_processor import document_processor
from src.services.embedding_service import embedding_service

router = APIRouter()


@router.post("/internal/process-document")
async def process_document(request: ProcessDocumentRequest):
    try:
        text = document_processor.process_document(
            request.storage_path,
        )

        documents = chunking_service.create_chunks(
            text=text,
            document_id=request.document_id,
            source=request.storage_path,
        )

        embedding_service.store_document(documents)

        return {
            "success": True,
            "chunks": len(documents),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )