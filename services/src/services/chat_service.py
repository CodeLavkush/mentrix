from clients.gemini_client import gemini_service
from utils.logger import logger
from .rag_service import rag_service


SYSTEM_PROMPT = """
You are Mentrix AI.

You answer questions ONLY using the provided document context.

Rules:

- Never invent information.
- If the answer is not present in the context, say:
  "I couldn't find this information in the uploaded document."
- Answer in markdown.
- Keep answers concise but complete.
"""


class ChatService:
    def ask(
        self,
        document_id: str,
        question: str,
    ) -> str:

        logger.info("Retrieving context...")

        documents = rag_service.retrieve(
            document_id=document_id,
            question=question,
        )

        context = "\n\n".join(
            doc.page_content
            for doc in documents
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