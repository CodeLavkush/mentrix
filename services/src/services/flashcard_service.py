from src.clients.gemini_client import gemini_service
from src.utils.logger import logger


class FlashcardService:
    """
    Generates flashcards from quiz questions.
    """

    def generate_flashcards(
        self,
        quiz_questions: list,
        total_cards: int,
    ) -> dict:

        logger.info(
            f"Generating flashcards | "
            f"available_questions={len(quiz_questions)} | "
            f"requested_cards={total_cards}"
        )

        # --------------------------------------------------
        # 1. Validate input
        # --------------------------------------------------

        if not quiz_questions:
            raise ValueError(
                "No quiz questions provided for flashcard generation."
            )

        if total_cards <= 0:
            raise ValueError(
                "total_cards must be greater than 0."
            )

        if total_cards > len(quiz_questions):
            raise ValueError(
                f"Cannot generate {total_cards} flashcards "
                f"from only {len(quiz_questions)} quiz questions."
            )

        # --------------------------------------------------
        # 2. Prepare quiz questions
        # --------------------------------------------------

        questions_context = []

        for index, question in enumerate(
            quiz_questions,
            start=1,
        ):
            questions_context.append(
                f"""
--- Quiz Question {index} ---

Question:
{question.get("question", "")}

Option A:
{question.get("optionA", question.get("option_a", ""))}

Option B:
{question.get("optionB", question.get("option_b", ""))}

Option C:
{question.get("optionC", question.get("option_c", ""))}

Option D:
{question.get("optionD", question.get("option_d", ""))}

Correct Option:
{question.get("correctAnswer", question.get("correct_option", ""))}

Explanation:
{question.get("explanation", "")}
"""
            )

        context = "\n".join(questions_context)

        # --------------------------------------------------
        # 3. Gemini prompt
        # --------------------------------------------------

        prompt = f"""
You are Mentrix, an AI-powered study assistant.

Your task is to generate study flashcards from the
provided quiz questions.

FLASHCARD REQUIREMENTS:

- Generate exactly {total_cards} flashcards.
- Each flashcard must contain:
  - front_text
  - back_text
  - difficulty
- difficulty MUST be exactly one of:
  - EASY
  - MEDIUM
  - HARD
- The front_text should test the student's knowledge.
- The back_text should provide the correct answer and
  a concise explanation.
- Do not include multiple-choice options in the flashcard.
- Do not include question IDs.
- Do not include quiz IDs.
- Do not include database-related fields.
- Do not create duplicate or nearly identical flashcards.
- Use ONLY the information provided in the quiz questions.
- Do not introduce outside knowledge.
- Make the flashcards useful for revision.

DIFFICULTY GUIDELINES:

EASY:
- Basic definitions
- Basic facts
- Terminology
- Direct recall

MEDIUM:
- Understanding concepts
- Relationships between concepts
- Comparisons
- Simple application

HARD:
- Deeper understanding
- Reasoning
- Analysis
- Application of concepts

IMPORTANT:

Return ONLY valid JSON.

Do NOT include:
- Markdown
- ```json
- ```
- Introductory text
- Any text after the JSON

The JSON MUST follow this EXACT structure:

{{
    "flashcards": [
        {{
            "front_text": "Question or concept",
            "back_text": "Answer and explanation",
            "difficulty": "EASY"
        }}
    ]
}}

JSON RULES:

1. "front_text" must be a non-empty string.
2. "back_text" must be a non-empty string.
3. "difficulty" must be exactly:
   "EASY", "MEDIUM", or "HARD".
4. Generate exactly {total_cards} flashcards.
5. Do not include an "id" field.
6. Do not include a "quiz_id" field.
7. Do not include a "flashcard_set_id" field.

QUIZ QUESTIONS:

{context}
"""

        # --------------------------------------------------
        # 4. Generate flashcards using Gemini
        # --------------------------------------------------

        logger.info(
            "Sending flashcard generation request to Gemini..."
        )

        flashcard_response = gemini_service.generate_json(
            prompt=prompt,
        )

        # --------------------------------------------------
        # 5. Validate top-level response
        # --------------------------------------------------

        if not isinstance(
            flashcard_response,
            dict,
        ):
            raise RuntimeError(
                "Gemini returned an invalid flashcard response."
            )

        flashcards = flashcard_response.get(
            "flashcards"
        )

        if not isinstance(
            flashcards,
            list,
        ):
            raise RuntimeError(
                "Gemini response does not contain a valid "
                "'flashcards' array."
            )

        # --------------------------------------------------
        # 6. Validate number of flashcards
        # --------------------------------------------------

        if len(flashcards) != total_cards:

            logger.warning(
                f"Expected {total_cards} flashcards, "
                f"but Gemini returned {len(flashcards)}."
            )

            raise RuntimeError(
                f"Expected {total_cards} flashcards, "
                f"but received {len(flashcards)}."
            )

        # --------------------------------------------------
        # 7. Validate individual flashcards
        # --------------------------------------------------

        valid_difficulties = {
            "EASY",
            "MEDIUM",
            "HARD",
        }

        required_fields = {
            "front_text",
            "back_text",
            "difficulty",
        }

        validated_flashcards = []

        for index, flashcard in enumerate(
            flashcards,
            start=1,
        ):

            if not isinstance(
                flashcard,
                dict,
            ):
                raise RuntimeError(
                    f"Flashcard {index} has an invalid structure."
                )

            # ----------------------------------------------
            # Check required fields
            # ----------------------------------------------

            missing_fields = (
                required_fields
                - flashcard.keys()
            )

            if missing_fields:
                raise RuntimeError(
                    f"Flashcard {index} is missing fields: "
                    f"{', '.join(missing_fields)}"
                )

            # ----------------------------------------------
            # Validate front_text
            # ----------------------------------------------

            front_text = flashcard.get(
                "front_text"
            )

            if (
                not isinstance(front_text, str)
                or not front_text.strip()
            ):
                raise RuntimeError(
                    f"Flashcard {index} contains "
                    f"an invalid 'front_text'."
                )

            # ----------------------------------------------
            # Validate back_text
            # ----------------------------------------------

            back_text = flashcard.get(
                "back_text"
            )

            if (
                not isinstance(back_text, str)
                or not back_text.strip()
            ):
                raise RuntimeError(
                    f"Flashcard {index} contains "
                    f"an invalid 'back_text'."
                )

            # ----------------------------------------------
            # Validate difficulty
            # ----------------------------------------------

            difficulty = flashcard.get(
                "difficulty"
            )

            if difficulty not in valid_difficulties:
                raise RuntimeError(
                    f"Flashcard {index} has an invalid "
                    f"difficulty: {difficulty}"
                )

            # ----------------------------------------------
            # Add validated flashcard
            # ----------------------------------------------

            validated_flashcards.append(
                {
                    "front_text": front_text.strip(),
                    "back_text": back_text.strip(),
                    "difficulty": difficulty,
                }
            )

        # --------------------------------------------------
        # 8. Final response
        # --------------------------------------------------

        logger.info(
            f"Successfully generated "
            f"{len(validated_flashcards)} flashcards."
        )

        return {
            "success": True,
            "total_cards": len(validated_flashcards),
            "flashcards": validated_flashcards,
        }


flashcard_service = FlashcardService()