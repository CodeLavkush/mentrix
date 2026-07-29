from pydantic import BaseModel


class ProcessDocumentRequest(BaseModel):
    document_id: str
    storage_path: str


class ChatRequest(BaseModel):
    document_id: str
    question: str