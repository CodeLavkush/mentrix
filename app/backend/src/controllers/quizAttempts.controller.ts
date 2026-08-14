import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import type { RequestHandler } from "express"
import { ApiError } from "../utils/api-error.js"
import { userQuery } from "../queries/user.query.js"
import { quizQuery } from "../queries/quiz.query.js"
import { quizAttemptQuery } from "../queries/quizAttempt.query.js"

const createQuizAttempts: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { quizId } = req.params
    const { score, totalMarks, percentage, timeTaken } = req.body

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

    const quiz = await quizQuery.findFirstOrThrow(
        {
            where: {
                id: quizId as string,
            },
            select: {
                id: true
            }
        },
        404,
        "Quiz does not exists."
    )

    const quizAttempts = await quizAttemptQuery.createOrThrow(
        {
            data: {
                quizId: quiz.id,
                userId,
                score,
                totalMarks,
                percentage,
                timeTaken,
            },
            select: {
                id: true,
                quizId: true,
                score: true,
                totalMarks: true,
                percentage: true,
                timeTaken: true,
                attemptedAt: true
            }
        },
        404,
        "Quiz attempt creation failed."
    )

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                quizAttempts,
                "Quiz attempt creation successfull."
            )
        )
})

const getAllAttempts: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { quizId } = req.params

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

    const quiz = await quizQuery.findFirstOrThrow(
        {
            where: {
                id: quizId as string,
            },
            select: {
                id: true
            }
        },
        404,
        "Quiz does not exists."
    )

    const quizAttempts = await quizAttemptQuery.findMany(
        {
            where: {
                quizId: quiz.id,
                userId,
            }
        }
    )

    if (quizAttempts.length === 0) {
        throw new ApiError(404, "Failed to fetched quiz attempts.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                quizAttempts,
                "Quiz attempts fetched successfully."
            )
        )
})

export {
    createQuizAttempts,
    getAllAttempts,
}