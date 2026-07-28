from qdrant_client.models import Filter, FieldCondition, MatchValue

from ..client.gemini_client import generate_content
from ..client.qdrant_client import vector_store
from ..utils.logger import logger


class RAGService:
    """
    Retrieval Augmented Generation Service.
    """

    def __init__(self, top_k: int = 5):
        self.top_k = top_k

    def retrieve(
        self,
        query: str,
        document_id: str,
    ):
        """
        Retrieve relevant chunks from Qdrant.
        """

        logger.info(
            "Searching document %s",
            document_id,
        )

        results = vector_store.similarity_search(
            query=query,
            k=self.top_k,
            filter=Filter(
                must=[
                    FieldCondition(
                        key="metadata.document_id",
                        match=MatchValue(value=document_id),
                    )
                ]
            ),
        )

        logger.info(
            "Retrieved %d chunks",
            len(results),
        )

        return results

    @staticmethod
    def build_context(results) -> str:
        """
        Build LLM context from retrieved chunks.
        """

        context = []

        for chunk in results:

            context.append(
                f"""
                    Page Number:
                    {chunk.metadata.get("page_label", "Unknown")}

                    Content:
                    {chunk.page_content}
                """
            )

        return "\n\n------------------------\n\n".join(context)

    def ask(
        self,
        query: str,
        document_id: str,
    ) -> str:
        """
        Execute the full RAG pipeline.
        """

        documents = self.retrieve(
            query=query,
            document_id=document_id,
        )

        if not documents:
            return (
                "I couldn't find any relevant information "
                "in the uploaded document."
            )

        context = self.build_context(documents)

        system_prompt = f"""
            You are Mentrix AI.

            You are answering questions ONLY using the supplied context.

            Rules:

            1. Never make up information.

            2. If the answer is not present,
            reply exactly:

            "I couldn't find that information in the uploaded document."

            3. Mention page numbers whenever possible.

            4. Keep answers concise but complete.

            Context:

            {context}
        """

        logger.info("Generating Gemini response...")

        response = generate_content(
            prompt=query,
            system_prompt=system_prompt,
        )

        logger.info("Gemini response generated")

        return response