import type { Difficulty } from "../../generated/prisma/enums.ts"

export type Flashcard = {
    front_text: string | null,
    back_text: string | null,
    difficulty: Difficulty
}