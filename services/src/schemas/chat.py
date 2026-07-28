from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    documentId: str = Field(
        ...,
        description="Document to search"
    )

    userId: str = Field(
        ...,
        description="Current user id"
    )

    query: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User question"
    )