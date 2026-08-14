import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import type { RequestHandler } from "express"
import { ApiError } from "../utils/api-error.js"
import type { Question } from "../types/quiz/index.js"
import { createQuizQuestion } from "./quizQuestions.controller.js"
import { userQuery } from "../queries/user.query.js"
import { documentQuery } from "../queries/document.query.js"
import { quizQuery } from "../queries/quiz.query.js"


const createQuiz: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params
    const { quizTitle, difficulty, totalQuestions } = req.body

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

    const document = await documentQuery.findFirstOrThrow(
        {
            where: {
                id: documentId as string
            },
            select: {
                id: true
            }
        },
        404,
        "Document does not exsits."
    )

    const response = await fetch(
        `${process.env.AI_SERVICE_URL}/api/v1/internal/quiz`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                document_id: document.id,
                total_questions: totalQuestions,
                difficulty,
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

    if (result?.questions?.length === 0) {
        throw new ApiError(404, "Quiz questions not found");
    }

    const quiz = await quizQuery.createOrThrow(
        {
            data: {
                userId,
                documentId: document.id,
                quizTitle,
                difficulty,
                totalQuestions,
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        username: true
                    }
                },
                document: {
                    select: {
                        id: true,
                        fileName: true,
                        fileType: true
                    }
                },
                quizTitle: true,
                difficulty: true,
                totalQuestions: true
            }
        },
        409,
        "Quiz creation failed."
    )

    await Promise.all(
        result.questions?.map(async (question: Question) => {
            createQuizQuestion(question, quiz.id)
        })
    )

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                quiz,
                "Quiz created successfully."
            )
        )

})

const getAllQuizzes: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params

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

    const document = await documentQuery.findFirstOrThrow(
        {
            where: {
                id: documentId as string
            },
            select: {
                id: true
            }
        },
        404,
        "Document does not exsits."
    )

    const quizzes = await quizQuery.findMany(
        {
            where: {
                userId,
                documentId: document.id,
            }
        }
    )

    if (quizzes.length === 0) {
        throw new ApiError(404, "Quizzes not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                quizzes,
                "Quzzes fetched successfully."
            )
        )
})

const getQuizById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId, quizId } = req.params

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

    const document = await documentQuery.findFirstOrThrow(
        {
            where: {
                id: documentId as string
            },
            select: {
                id: true
            }
        },
        404,
        "Document does not exsits."
    )

    const quiz = await quizQuery.findFirstOrThrow(
        {
            where: {
                id: quizId as string,
                documentId: document.id,
                userId,
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                    }
                },
                document: {
                    select: {
                        id: true,
                        fileName: true,
                    }
                },
                quizTitle: true,
                difficulty: true,
                totalQuestions: true,
                createdAt: true,
            }
        },
        404,
        "Quiz not found."
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                quiz,
                "Quiz fetched successfully"
            )
        )
})

const deleteQuizById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId, quizId } = req.params

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

    const document = await documentQuery.findFirstOrThrow(
        {
            where: {
                id: documentId as string
            },
            select: {
                id: true
            }
        },
        404,
        "Document does not exsits."
    )

    const deletedQuiz = await quizQuery.delete(
        {
            where: {
                id: quizId as string,
                documentId: document.id,
                userId,
            }
        }
    )

    if (!deletedQuiz) {
        throw new ApiError(404, "Quiz failed to delete.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedQuiz,
                "Quiz deleted successfully."
            )
        )

})

const deleteQuizzes: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params

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

    const document = await documentQuery.findFirstOrThrow(
        {
            where: {
                id: documentId as string
            },
            select: {
                id: true
            }
        },
        404,
        "Document does not exsits."
    )

    const deletedQuizzes = await quizQuery.deleteMany(
        {
            where: {
                documentId: document.id,
                userId,
            }
        }
    )

    if (deletedQuizzes.count === 0) {
        throw new ApiError(404, "Quizzes failed to delete.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedQuizzes,
                "Quiz deleted successfully."
            )
        )

})

export {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    deleteQuizById,
    deleteQuizzes,
}