import type { RequestHandler } from "express"
import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { userQuery } from "../queries/user.query.js"
import { flashcardQuery } from "../queries/flashcard.query.js"
import { flashcardProgressQuery } from "../queries/flashcardprogress.query.js"


const createFlashcardProgress: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { flashcardId } = req.params
    const { reviewCount, correctCount, lastReviewed, masteryLevel } = req.body

    await userQuery.findFirstOrThrow(
        {
            where: {
                id: userId
            },
            select: {
                id: true
            }
        },
        404,
        "User does not exists."
    )

    const flashcard = await flashcardQuery.findFirstOrThrow(
        {
            where: {
                id: flashcardId as string,
            },
            select: {
                id: true
            }
        },
        404,
        "Flashcard does not exists."
    )

    const flashcardProgress = await flashcardProgressQuery.createOrThrow(
        {
            data: {
                reviewCount,
                correctCount,
                lastReviewed,
                masteryLevel,
                flashcardId: flashcard.id,
                userId,
            },
            select: {
                id: true,
                reviewCount: true,
                correctCount: true,
                lastReviewed: true,
                masteryLevel: true,
                flashcardId: true,
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                }
            }
        },
        404,
        "Failed to create flashcard progress."
    )

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                flashcardProgress,
                "Flashcard progress creation successfully."
            )
        )
})

const getAllFlashcardProgress: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { flashcardId } = req.params

    await userQuery.findFirstOrThrow(
        {
            where: {
                id: userId
            },
            select: {
                id: true
            }
        },
        404,
        "User does not exists."
    )

    const flashcard = await flashcardQuery.findFirstOrThrow(
        {
            where: {
                id: flashcardId as string,
            },
            select: {
                id: true
            }
        },
        404,
        "Flashcard does not exists."
    )

    const flashcardProgress = await flashcardProgressQuery.findMany({
        where: {
            flashcardId: flashcard.id,
            userId
        },
        select: {
            id: true,
            reviewCount: true,
            correctCount: true,
            lastReviewed: true,
            masteryLevel: true,
            flashcardId: true,
            user: {
                select: {
                    id: true,
                    username: true,
                }
            }
        }
    })

    if (flashcardProgress.length === 0) {
        throw new ApiError(404, "Flashcard progress not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                flashcardProgress,
                "Flashcard progress fetched successfully."
            )
        )
})

const deleteFlashcardProgressById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { flashcardId, flashcardProgressId } = req.params

    await userQuery.findFirstOrThrow(
        {
            where: {
                id: userId
            },
            select: {
                id: true
            }
        },
        404,
        "User does not exists."
    )

    const flashcard = await flashcardQuery.findFirstOrThrow(
        {
            where: {
                id: flashcardId as string,
            },
            select: {
                id: true
            }
        },
        404,
        "Flashcard does not exists."
    )

    const deletedFlashcardProgress = await flashcardProgressQuery.delete(
        {
            where: {
                id: flashcardProgressId as string,
                flashcardId: flashcard.id,
                userId
            }
        }
    )
    if (!deletedFlashcardProgress) {
        throw new ApiError(404, "Flashcard progress failed to delete.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedFlashcardProgress,
                "Flashcard progress successfully deleted."
            )
        )
})

const deleteAllFlashcardProgress: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { flashcardId } = req.params

    await userQuery.findFirstOrThrow(
        {
            where: {
                id: userId
            },
            select: {
                id: true
            }
        },
        404,
        "User does not exists."
    )


    const flashcard = await flashcardQuery.findFirstOrThrow(
        {
            where: {
                id: flashcardId as string,
            },
            select: {
                id: true
            }
        },
        404,
        "Flashcard does not exists."
    )

    const deletedFlashcardProgresses = await flashcardProgressQuery.deleteMany(
        {
            where: {
                flashcardId: flashcard.id,
            },
        }
    )

    if (deletedFlashcardProgresses.count === 0) {
        throw new ApiError(404, "Flashcard progresses failed to delete.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedFlashcardProgresses,
                "Flashcard progresses deleted successfully."
            )
        )
})

export {
    createFlashcardProgress,
    getAllFlashcardProgress,
    deleteAllFlashcardProgress,
    deleteFlashcardProgressById,
}