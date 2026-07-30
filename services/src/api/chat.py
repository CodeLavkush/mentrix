from fastapi import APIRouter

from src.models.schemas import ChatRequest
from src.services.chat_service import chat_service

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    answer = chat_service.ask(
        document_id=request.document_id,
        question=request.question,
    )

    return {
        "answer": answer,
    }