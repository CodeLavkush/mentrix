import re

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.utils.config import settings
from src.utils.logger import logger


class ChunkingService:
    """
    Splits extracted document text into semantic chunks.
    """

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=[
                "\n\n",
                "\n",
                ". ",
                "? ",
                "! ",
                "; ",
                ", ",
                " ",
                "",
            ],
            length_function=len,
        )

    def create_chunks(
        self,
        text: str,
        document_id: str,
        source: str,
    ) -> list[Document]:
        """
        Convert extracted text into LangChain Documents.
        """

        logger.info("Creating document chunks...")

        text = self._normalize_text(text)

        if not text:
            logger.warning("Document contains no text.")
            return []

        raw_chunks = self.text_splitter.split_text(text)

        documents: list[Document] = []

        total_chunks = len(raw_chunks)

        for index, chunk in enumerate(raw_chunks):
            chunk = chunk.strip()

            if not chunk:
                continue

            documents.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "document_id": document_id,
                        "source": source,
                        "chunk_index": index,
                        "total_chunks": total_chunks,
                        "chunk_length": len(chunk),
                    },
                )
            )

        logger.info(
            "Created %d chunks from %d characters.",
            len(documents),
            len(text),
        )

        return documents

    @staticmethod
    def _normalize_text(text: str) -> str:
        """
        Normalize extracted text before chunking.
        """

        text = text.replace("\r\n", "\n")
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)

        return text.strip()


chunking_service = ChunkingService()