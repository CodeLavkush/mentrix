from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.services.flashcard_service import FlashcardService


router = APIRouter()


class FlashcardRequest(BaseModel):
    quiz_questions: list[dict[str, Any]]
    total_cards: int = Field(gt=0)


flashcard_service = FlashcardService()


@router.post("/internal/flashcard")
async def generate_flashcards(
    request: FlashcardRequest,
):
    try:
        result = flashcard_service.generate_flashcards(
            quiz_questions=request.quiz_questions,
            total_cards=request.total_cards,
        )

        return result

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Failed to generate flashcards.",
        ) from exc