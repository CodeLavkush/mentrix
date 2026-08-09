import type { RequestHandler } from "express"
import { prisma } from "../db/prisma.js"
import type { Flashcard } from "../types/flashcard/index.js"
import { logger } from "../utils/logger.js"
import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"

const createFlashcard = async (flashcard: Flashcard, flashcardSetId: string) => {
    try {
        await prisma.flashcards.create({
            data: {
                flashcardSetId,
                frontText: flashcard.front_text!,
                backText: flashcard.back_text!,
                difficulty: flashcard.difficulty,
            }
        })

    } catch (error) {
        logger.error("Failed to create flashcards ERROR: " + error)
    }
}

const getAllFlashCards: RequestHandler = asyncHandler(async (req, res) => {
    const { flashcardSetId } = req.params

    const flashcardSets = await prisma.flashcardSets.findFirst({
        where: {
            id: flashcardSetId as string,
        },
        select: {
            id: true
        }
    })

    if (!flashcardSets) {
        throw new ApiError(404, "Flashcard sets does not exists.")
    }

    const flashcards = await prisma.flashcards.findMany({
        where: {
            flashcardSetId: flashcardSets.id,
        },
        select: {
            id: true,
            frontText: true,
            backText: true,
            difficulty: true,
            flashcardSet: {
                select: {
                    title: true,
                    totalCards: true
                }
            },
            createdAt: true
        }
    })

    if (flashcards.length === 0) {
        throw new ApiError(404, "Failed to fetched flashcards.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                flashcards,
                "Flashcards fetched successfully."
            )
        )

})

export {
    createFlashcard,
    getAllFlashCards,
}