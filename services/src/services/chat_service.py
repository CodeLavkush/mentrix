from src.clients.gemini_client import gemini_service
from src.utils.logger import logger
from .rag_service import get_rag_service


SYSTEM_PROMPT = """
You are Mentrix AI, an AI study assistant.

Answer ONLY using the provided document context.

Rules:
- Use only the context below.
- If the answer is partially available, answer using the available information.
- Do not invent facts.
- If the context contains no relevant information, reply exactly:
  "I couldn't find this information in the uploaded document."
- Respond in markdown.
"""


class ChatService:
    def ask(
        self,
        document_id: str,
        question: str,
    ) -> str:

        logger.info("Retrieving context...")

        documents = get_rag_service().retrieve(
            document_id=document_id,
            question=question,
        )

        context = "\n\n".join(
            f"[Chunk {i + 1}]\n{doc.page_content}"
            for i, doc in enumerate(documents)
        )

        prompt = f"""
                    {SYSTEM_PROMPT}

                    Context:

                    {context}

                    Question:

                    {question}

                    Answer:
                """

        logger.info("Generating Gemini response...")

        answer = gemini_service.generate(prompt)

        return answer


chat_service = ChatService()