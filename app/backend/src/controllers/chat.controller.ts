import type { RequestHandler } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import { prisma } from "../db/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";


const sendMessage: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params
    const { message } = req.body

    const document = await prisma.documents.findFirst({
        where: {
            id: documentId as string,
        },
        select: {
            id: true
        }
    })

    if (!document) {
        throw new ApiError(404, "Document does not exsists")
    }

    const userMessage = await prisma.chatMessages.create({
        data: {
            userId,
            documentId: documentId as string,
            sender: "USER",
            message
        },
        select: {
            id: true,
            message: true,
        }
    })

    if (!userMessage) {
        throw new ApiError(404, "Chat message cannot be sent")
    }

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

    const aiMessage = await prisma.chatMessages.create({
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
    })

    if (!aiMessage) {
        throw new ApiError(404, "AI won't be able to reply..")
    }

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

    const document = await prisma.documents.findFirst({
        where: {
            id: documentId as string,
        },
        select: {
            id: true,
            fileName: true,
        }
    })

    if (!document) {
        throw new ApiError(404, "Document does not exsists")
    }

    const messages = await prisma.chatMessages.findMany({
        where: {
            userId,
            documentId: documentId as string,
        },
        select: {
            id: true,
            message: true,
            sender: true,
            timestamp: true,
        }
    })

    if (messages.length < 0) {
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