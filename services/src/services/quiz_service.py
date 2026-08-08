from src.clients.gemini_client import gemini_service
from src.clients.qdrant_client import qdrant_service
from src.utils.logger import logger


class QuizService:
    """
    Generates quizzes from processed document content
    stored in Qdrant.
    """

    def generate_quiz(
        self,
        document_id: str,
        total_questions: int,
        difficulty: str,
    ) -> dict:

        logger.info(
            f"Generating quiz | "
            f"document={document_id} | "
            f"questions={total_questions} | "
            f"difficulty={difficulty}"
        )

        # --------------------------------------------------
        # 1. Get document chunks from Qdrant
        # --------------------------------------------------

        chunks = qdrant_service.get_document_chunks(
            document_id=document_id,
        )

        if not chunks:
            logger.warning(
                f"No chunks found for document: {document_id}"
            )

            raise ValueError(
                "No processed content found for this document."
            )

        logger.info(
            f"Retrieved {len(chunks)} chunks "
            f"for quiz generation."
        )

        # --------------------------------------------------
        # 2. Build context
        # --------------------------------------------------

        context = "\n\n".join(
            f"--- Study Material {index + 1} ---\n{chunk}"
            for index, chunk in enumerate(chunks)
        )

        # Prevent excessively large Gemini requests.
        max_context_length = 100_000

        if len(context) > max_context_length:

            logger.warning(
                f"Document context is too large "
                f"({len(context)} characters). "
                f"Truncating to {max_context_length} characters."
            )

            context = context[:max_context_length]

        # --------------------------------------------------
        # 3. Gemini prompt
        # --------------------------------------------------

        prompt = f"""
You are Mentrix, an AI-powered study assistant.

Your task is to generate a multiple-choice quiz using ONLY
the provided study material.

QUIZ REQUIREMENTS:

- Generate exactly {total_questions} questions.
- Difficulty level: {difficulty}.
- Every question must have exactly 4 options.
- The options must be A, B, C, and D.
- Only ONE option must be correct.
- Do not create duplicate or very similar questions.
- Every question must be answerable using ONLY the provided
  study material.
- Do not use outside knowledge.
- Do not make up facts that are not present in the study material.
- Questions must be clear and educational.
- Avoid ambiguous questions where multiple options could be correct.
- Provide a short explanation for every correct answer.

DIFFICULTY GUIDELINES:

EASY:
- Test basic definitions, facts, terminology, and direct concepts.
- Focus mainly on recall and basic understanding.

MEDIUM:
- Test understanding of concepts.
- Test relationships between concepts.
- Include simple application and comparison questions.

HARD:
- Test deeper understanding.
- Include reasoning, comparison, analysis, and application.
- Questions should require careful understanding of the material.

IMPORTANT:

Return ONLY valid JSON.

Do NOT include:
- Markdown
- ```json
- ```
- Any introductory text
- Any text after the JSON

The JSON MUST follow this EXACT structure:

{{
    "questions": [
        {{
            "question": "Question text",
            "option_a": "Option A text",
            "option_b": "Option B text",
            "option_c": "Option C text",
            "option_d": "Option D text",
            "correct_option": "A",
            "explanation": "Short explanation of the correct answer."
        }}
    ]
}}

JSON RULES:

1. "question" must contain the complete question.
2. "option_a" must contain option A only.
3. "option_b" must contain option B only.
4. "option_c" must contain option C only.
5. "option_d" must contain option D only.
6. "correct_option" MUST be exactly one of:
   "A", "B", "C", or "D".
7. "explanation" must explain why the selected option is correct.
8. Do not include an "id" field.
9. Do not include a "quiz_id" field.
10. Do not include a "document_id" field inside questions.
11. Generate exactly {total_questions} questions.

STUDY MATERIAL:

{context}
"""

        # --------------------------------------------------
        # 4. Generate quiz using Gemini
        # --------------------------------------------------

        logger.info(
            "Sending quiz generation request to Gemini..."
        )

        quiz = gemini_service.generate_json(
            prompt=prompt,
        )

        # --------------------------------------------------
        # 5. Validate top-level response
        # --------------------------------------------------

        if not isinstance(quiz, dict):

            raise RuntimeError(
                "Gemini returned an invalid quiz response."
            )

        questions = quiz.get("questions")

        if not isinstance(questions, list):

            raise RuntimeError(
                "Gemini response does not contain a valid "
                "'questions' array."
            )

        # --------------------------------------------------
        # 6. Validate number of questions
        # --------------------------------------------------

        if len(questions) != total_questions:

            logger.warning(
                f"Expected {total_questions} questions, "
                f"but Gemini returned {len(questions)}."
            )

            raise RuntimeError(
                f"Expected {total_questions} questions, "
                f"but received {len(questions)}."
            )

        # --------------------------------------------------
        # 7. Validate individual questions
        # --------------------------------------------------

        validated_questions = []

        valid_options = {
            "A",
            "B",
            "C",
            "D",
        }

        required_fields = {
            "question",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_option",
            "explanation",
        }

        for index, question in enumerate(
            questions,
            start=1,
        ):

            if not isinstance(question, dict):

                raise RuntimeError(
                    f"Question {index} has an invalid structure."
                )

            # Check required fields
            missing_fields = (
                required_fields
                - question.keys()
            )

            if missing_fields:

                raise RuntimeError(
                    f"Question {index} is missing fields: "
                    f"{', '.join(missing_fields)}"
                )

            # Validate text fields
            text_fields = [
                "question",
                "option_a",
                "option_b",
                "option_c",
                "option_d",
            ]

            for field in text_fields:

                value = question.get(field)

                if not isinstance(value, str) or not value.strip():

                    raise RuntimeError(
                        f"Question {index} contains "
                        f"an invalid '{field}'."
                    )

            # Validate correct option
            correct_option = question.get(
                "correct_option"
            )

            if correct_option not in valid_options:

                raise RuntimeError(
                    f"Question {index} has an invalid "
                    f"correct_option: {correct_option}"
                )

            # Validate explanation
            explanation = question.get(
                "explanation"
            )

            if explanation is not None:

                if (
                    not isinstance(explanation, str)
                    or not explanation.strip()
                ):
                    raise RuntimeError(
                        f"Question {index} has "
                        f"an invalid explanation."
                    )

            validated_questions.append(
                {
                    "question": question["question"].strip(),

                    "option_a": question["option_a"].strip(),

                    "option_b": question["option_b"].strip(),

                    "option_c": question["option_c"].strip(),

                    "option_d": question["option_d"].strip(),

                    "correct_option": correct_option,

                    "explanation": (
                        explanation.strip()
                        if isinstance(explanation, str)
                        else None
                    ),
                }
            )

        # --------------------------------------------------
        # 8. Final response
        # --------------------------------------------------

        logger.info(
            f"Successfully generated "
            f"{len(validated_questions)} quiz questions "
            f"for document {document_id}."
        )

        return {
            "success": True,
            "document_id": document_id,
            "difficulty": difficulty,
            "total_questions": len(validated_questions),
            "questions": validated_questions,
        }


quiz_service = QuizService()