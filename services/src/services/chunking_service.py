from uuid import uuid4

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from ..utils.config import settings
from ..utils.logger import logger


class ChunkingService:
    """
    Responsible for splitting documents into chunks while
    preserving metadata.
    """

    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                "",
            ],
        )

    def split(
        self,
        documents: list[Document],
    ) -> list[Document]:
        """
        Split LangChain documents into chunks.

        Args:
            documents: Extracted documents

        Returns:
            Chunked documents
        """

        logger.info(
            "Splitting %d document(s)...",
            len(documents),
        )

        chunks = self.text_splitter.split_documents(documents)

        for index, chunk in enumerate(chunks, start=1):

            chunk.metadata["chunk_id"] = str(uuid4())
            chunk.metadata["chunk_index"] = index

        logger.info(
            "Generated %d chunks",
            len(chunks),
        )

        return chunks