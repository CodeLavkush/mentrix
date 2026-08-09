import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import type { RequestHandler } from "express"
import { prisma } from "../db/prisma.js"
import { ApiError } from "../utils/api-error.js"

const createQuizAttempts: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { quizId } = req.params
    const { score, totalMarks, percentage, timeTaken } = req.body

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const quiz = await prisma.quizzes.findFirst({
        where: {
            id: quizId as string,
        },
        select: {
            id: true
        }
    })

    if (!quiz) {
        throw new ApiError(404, "Quiz does not exists.")
    }

    const quizAttempts = await prisma.quizAttempts.create({
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
    })

    if (!quizAttempts) {
        throw new ApiError(404, "Quiz attempt creation failed.")
    }

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

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const quiz = await prisma.quizzes.findFirst({
        where: {
            id: quizId as string,
        },
        select: {
            id: true
        }
    })

    if (!quiz) {
        throw new ApiError(404, "Quiz does not exists.")
    }

    const quizAttempts = await prisma.quizAttempts.findMany({
        where: {
            quizId: quiz.id,
            userId,
        }
    })

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