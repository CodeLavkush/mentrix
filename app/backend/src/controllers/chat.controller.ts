import type { RequestHandler } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { documentQuery } from "../queries/document.query.js";
import { chatMessageQuery } from "../queries/chatMessage.query.js";


const sendMessage: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params
    const { message } = req.body

    const document = await documentQuery.findFirstOrThrow(
        {
            where: {
                id: documentId as string,
            },
            select: {
                id: true
            }
        },
        404,
        "Document does not exsists"
    )

    const userMessage = await chatMessageQuery.createOrThrow(
        {
            data: {
                userId,
                documentId: document.id,
                sender: "USER",
                message
            },
            select: {
                id: true,
                message: true,
            }

        },
        404,
        "Chat message cannot be sent"
    )


    const response = await fetch(
        `${process.env.AI_SERVICE_URL}/api/v1/internal/chat`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                document_id: documentId,
                question: userMessage.message,
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

    if (!result) {
        throw new ApiError(404, "Answer not found");
    }

    const aiMessage = await chatMessageQuery.createOrThrow(
        {
            data: {
                userId,
                documentId: documentId as string,
                sender: "AI",
                message: result?.answer
            },
            select: {
                id: true,
                message: true,
            }
        },
        404,
        "AI won't be able to reply.."
    )

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                aiMessage,
                "AI Message sent."
            )
        )
})

const getMessages: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params

    const document = await documentQuery.findFirstOrThrow(
        {
            where: {
                id: documentId as string,
            },
            select: {
                id: true
            }
        },
        404,
        "Document does not exsists"
    )

    const messages = await chatMessageQuery.findMany({
        where: {
            userId,
            documentId: document.id,
        },
        select: {
            id: true,
            message: true,
            sender: true,
            timestamp: true,
        }
    })

    if (messages.length === 0) {
        throw new ApiError(404, "Messages not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    messages,
                    document,
                },
                "Messages fetched successfully"
            )
        )
})

export {
    sendMessage,
    getMessages
}