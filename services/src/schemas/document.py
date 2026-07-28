from pydantic import BaseModel, Field


class ProcessDocumentRequest(BaseModel):
    documentId: str = Field(
        ...,
        description="Unique document id from PostgreSQL"
    )

    userId: str = Field(
        ...,
        description="Owner of the document"
    )

    storagePath: str = Field(
        ...,
        description="MinIO object path"
    )