from src.services.rag_service import get_rag_service
from src.clients.gemini_client import gemini_service
from src.utils.logger import logger


class NoteService:

    def __init__(self):
        self.rag_service = get_rag_service()

    def generate_note(
        self,
        document_id: str,
        title: str,
    ) -> str:

        logger.info(
            f"Generating note for document {document_id} with title '{title}'"
        )

        # Retrieve relevant document chunks.
        documents = self.rag_service.retrieve(
            document_id=document_id,
            question=title,
            limit=10,
            score_threshold=0.3,
        )

        if not documents:
            raise ValueError(
                "No relevant content found for this document."
            )

        # Combine retrieved chunks into context.
        context = "\n\n".join(
            document.page_content
            for document in documents
        )

        prompt = f"""
You are Mentrix, an AI-powered academic learning assistant.

Your task is to create clear, well-structured study notes from
the provided academic material.

The student requested notes on:

{title}

Use ONLY the information provided in the source material.
Do not invent facts, examples, definitions, or information that
does not appear in the source material.

The notes should:

- Be easy for a college student to understand.
- Clearly explain the important concepts.
- Organize information using meaningful headings.
- Highlight important points.
- Include definitions where appropriate.
- Include examples only when they are present or clearly supported
  by the source material.
- Avoid unnecessary repetition.
- Be useful for examination revision.
- Preserve important technical terminology.
- Be concise but sufficiently detailed.

Return ONLY Markdown content.

Use the following structure when appropriate:

# {title}

## Overview

A concise explanation of the topic.

## Key Concepts

Explain the major concepts found in the source material.

### Concept

Explanation of the concept.

## Important Points

- Important point
- Important point
- Important point

## Examples

Include relevant examples from the source material.

## Summary

Provide a concise revision-oriented summary.

Do not include sections that have no relevant information.
Do not mention that you are an AI.
Do not mention the source material or this prompt.

SOURCE MATERIAL:

{context}
"""

        try:
            note_content = gemini_service.generate(prompt)

        except Exception as error:
            logger.error(
                f"Failed to generate note for document "
                f"{document_id}: {error}"
            )
            raise

        if not note_content or not note_content.strip():
            raise RuntimeError(
                "Gemini returned empty note content."
            )

        logger.info(
            f"Successfully generated note for document {document_id}"
        )

        return note_content.strip()


_note_service = None


def get_note_service():
    global _note_service

    if _note_service is None:
        _note_service = NoteService()

    return _note_service