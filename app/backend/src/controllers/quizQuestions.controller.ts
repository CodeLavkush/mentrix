import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import type { RequestHandler } from "express"
import { prisma } from "../db/prisma.js"
import { ApiError } from "../utils/api-error.js"
import type { Question } from "../types/quiz/index.js"
import { logger } from "../utils/logger.js"

const createQuizQuestion = async (question: Question, quizId: string) => {
    try {
        await prisma.quizQuestions.create({
            data: {
                quizId,
                question: question.question!,
                optionA: question.option_a!,
                optionB: question.option_b!,
                optionC: question.option_c!,
                optionD: question.option_d!,
                correctOption: question.correct_option!,
                explanation: question.explanation!,
            },
        })

    } catch (error) {
        logger.error("Failed to create quiz question ERROR: " + error)
    }
}


const getAllQuizQuestions: RequestHandler = asyncHandler(async (req, res) => {
    const { quizId } = req.params

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

    const quizQuestions = await prisma.quizQuestions.findMany({
        where: {
            quizId: quiz.id,
        }
    })

    if (quizQuestions.length === 0) {
        throw new ApiError(404, "Quiz questions not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                quizQuestions,
                "Quiz questions fetched successfully."
            )
        )

})
export {
    createQuizQuestion,
    getAllQuizQuestions
}