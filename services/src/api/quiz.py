from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from src.services.quiz_service import quiz_service
from src.utils.logger import logger


router = APIRouter()


class GenerateQuizRequest(BaseModel):

    document_id: str

    total_questions: int = Field(
        gt=0,
        le=50,
    )

    difficulty: str


@router.post("/internal/quiz")
def generate_quiz(
    request: GenerateQuizRequest,
):

    logger.info(
        f"Quiz request received | "
        f"document={request.document_id} | "
        f"questions={request.total_questions} | "
        f"difficulty={request.difficulty}"
    )

    try:

        return quiz_service.generate_quiz(
            document_id=request.document_id,
            total_questions=request.total_questions,
            difficulty=request.difficulty,
        )

    except ValueError as error:

        logger.warning(
            f"Quiz validation error: {error}"
        )

        raise HTTPException(
            status_code=404,
            detail=str(error),
        )

    except Exception as error:

        logger.exception(
            "Quiz generation failed."
        )

        raise HTTPException(
            status_code=500,
            detail="Quiz generation failed.",
        ) from error