from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.utils.config import settings
from src.utils.logger import logger


class ChunkingService:
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
        Split extracted text into LangChain Documents.
        """

        logger.info("Creating document chunks...")

        if not text.strip():
            logger.warning("Document contains no text.")
            return []

        chunks = self.text_splitter.split_text(text)

        documents: list[Document] = []

        total = len(chunks)

        for index, chunk in enumerate(chunks):
            documents.append(
                Document(
                    page_content=chunk,
                    metadata={
                        "document_id": document_id,
                        "source": source,
                        "chunk_index": index,
                        "total_chunks": total,
                    },
                )
            )

        logger.info(f"Created {len(documents)} chunks.")

        return documents


chunking_service = ChunkingService()