import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import type { RequestHandler } from "express"
import { prisma } from "../db/prisma.js"
import { ApiError } from "../utils/api-error.js"
import type { Flashcard } from "../types/flashcard/index.js"
import { createFlashcard } from "./flashcard.controller.js"

const createFlashcardSet: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { quizAttemptId } = req.params
    const { title, topic, totalCards } = req.body

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const quizAttempt = await prisma.quizAttempts.findFirst({
        where: {
            id: quizAttemptId as string,
            userId,
        },
        select: {
            id: true,
            quizId: true
        }
    })

    if (!quizAttempt) {
        throw new ApiError(404, "Quiz attempt not found.")
    }

    const quizQuestions = await prisma.quizQuestions.findMany({
        where: {
            quizId: quizAttempt.quizId
        },
        select: {
            question: true,
            optionA: true,
            optionB: true,
            optionC: true,
            optionD: true,
            correctOption: true,
            explanation: true
        }
    })

    if (quizQuestions.length === 0) {
        throw new ApiError(404, "Quiz questions does not exists.")
    }

    const flashcardsets = await prisma.flashcardSets.findFirst({
        where: {
            quizAttemptId: quizAttempt.id
        },
        select: {
            id: true
        }
    })

    if (flashcardsets) {
        throw new ApiError(404, "Flashcard sets already exists.")
    }

    const response = await fetch(
        `${process.env.AI_SERVICE_URL}/api/v1/internal/flashcard`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                quiz_questions: quizQuestions,
                total_cards: totalCards,
            }),
            signal: AbortSignal.timeout(10 * 60 * 1000), // 10 minutes
        }
    );

    if (!response.ok) {
        throw new ApiError(
            404,
            "AI Service Error"
        );
    }

    const result = await response.json();

    if (result?.flashcards?.length === 0) {
        throw new ApiError(404, "Flashcards not found");
    }

    const flashcardSet = await prisma.flashcardSets.create({
        data: {
            userId,
            quizAttemptId: quizAttempt.id,
            title,
            topic,
            totalCards,
        },
        select: {
            id: true,
            title: true,
            topic: true,
            totalCards: true,
            user: {
                select: {
                    id: true,
                    username: true
                }
            },
            quizAttempt: {
                select: {
                    id: true,
                    score: true,
                }
            }
        }
    })

    if (!flashcardSet) {
        throw new ApiError(404, "Flashcard set creation failed.")
    }

    await Promise.all(
        result.flashcards?.map(async (flashcard: Flashcard) => {
            createFlashcard(flashcard, flashcardSet.id)
        })
    )

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                flashcardSet,
                "Flashcard set created succesfully."
            )
        )
})

const getAllFlashcardSets: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { quizAttemptId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const quizAttempt = await prisma.quizAttempts.findFirst({
        where: {
            id: quizAttemptId as string,
            userId,
        },
        select: {
            id: true,
        }
    })

    if (!quizAttempt) {
        throw new ApiError(404, "Quiz attempt not found.")
    }

    const flashcardSets = await prisma.flashcardSets.findMany({
        where: {
            userId,
            quizAttemptId: quizAttempt.id,
        },
        select: {
            id: true,
            title: true,
            topic: true,
            totalCards: true,
            quizAttemptId: true,
            user: {
                select: {
                    id: true,
                    username: true
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    if (flashcardSets.length === 0) {
        throw new ApiError(404, "Flashcard sets not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                flashcardSets,
                "Flashcards fetched successfully."
            )
        )
})

const getFlashcardSetsById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { quizAttemptId, flashcardSetsId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const quizAttempt = await prisma.quizAttempts.findFirst({
        where: {
            id: quizAttemptId as string,
            userId,
        },
        select: {
            id: true,
        }
    })

    if (!quizAttempt) {
        throw new ApiError(404, "Quiz attempt not found.")
    }

    const flashcardSets = await prisma.flashcardSets.findFirst({
        where: {
            userId,
            quizAttemptId: quizAttempt.id,
            id: flashcardSetsId as string,
        },
        select: {
            id: true,
            title: true,
            topic: true,
            totalCards: true,
            quizAttemptId: true,
            user: {
                select: {
                    id: true,
                    username: true
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    if (!flashcardSets) {
        throw new ApiError(404, "Flashcard sets not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                flashcardSets,
                "Flashcard sets fetched successfully."
            )
        )
})

const deleteAllFlashcardSets: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { quizAttemptId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const quizAttempt = await prisma.quizAttempts.findFirst({
        where: {
            id: quizAttemptId as string,
            userId,
        },
        select: {
            id: true,
        }
    })

    if (!quizAttempt) {
        throw new ApiError(404, "Quiz attempt not found.")
    }

    const deletedFlashcardSets = await prisma.flashcardSets.deleteMany({
        where: {
            userId,
            quizAttemptId: quizAttempt.id
        }
    })

    if (deletedFlashcardSets.count === 0) {
        throw new ApiError(404, "Flashcard sets falied to delete.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedFlashcardSets,
                "Flashcard deleted successfully."
            )
        )
})

const deleteFlashcardSetsById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { quizAttemptId, flashcardSetsId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const quizAttempt = await prisma.quizAttempts.findFirst({
        where: {
            id: quizAttemptId as string,
            userId,
        },
        select: {
            id: true,
        }
    })

    if (!quizAttempt) {
        throw new ApiError(404, "Quiz attempt not found.")
    }

    const deletedFlashcardSets = await prisma.flashcardSets.delete({
        where: {
            id: flashcardSetsId as string,
            quizAttemptId: quizAttempt.id,
            userId,
        }
    })

    if (!deletedFlashcardSets) {
        throw new ApiError(404, "Flascard sets failed to delete.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedFlashcardSets,
                "Flashcard sets deleted successfully."
            )
        )
})

export {
    createFlashcardSet,
    getAllFlashcardSets,
    getFlashcardSetsById,
    deleteAllFlashcardSets,
    deleteFlashcardSetsById,
}