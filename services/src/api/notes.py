from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from src.services.note_service import get_note_service
from src.utils.logger import logger


router = APIRouter()

note_service = get_note_service()


class GenerateNoteRequest(BaseModel):
    title: str
    documentId: str


@router.post("/internal/notes")
def generate_note(request: GenerateNoteRequest):

    try:
        content = note_service.generate_note(
            document_id=request.documentId,
            title=request.title,
        )

        return {
            "content": content
        }

    except ValueError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception as error:
        logger.error(
            f"Note generation failed: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate note.",
        )