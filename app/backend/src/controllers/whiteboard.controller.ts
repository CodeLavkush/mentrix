import { prisma } from '../db/prisma.js'
import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { type RequestHandler } from "express"
import { uploadFile } from '../services/storage.service.js'
import type { InputJsonValue } from '@prisma/client/runtime/client'


const createWhiteboard: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { title, drawingData } = req.body

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User not found.")
    }

    let thumbnail: string | null = null;

    if (req.file) {
        thumbnail = `users/whiteboard/${Date.now()}-${req.file.originalname}`;

        await uploadFile(
            thumbnail,
            req.file.buffer,
            req.file.mimetype,
        );
    }

    const whiteboard = await prisma.whiteboards.create({
        data: {
            userId,
            title: title as string,
            drawingData: drawingData as InputJsonValue,
            thumbnail,
        },
        select: {
            id: true,
            title: true,
            drawingData: true,
            thumbnail: true,
            user: {
                select: {
                    id: true,
                    username: true,
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    if (!whiteboard) {
        throw new ApiError(404, "Whiteboard creation failed.")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                whiteboard,
                "Whiteboard created successfully."
            )
        )
})

const getAllWhiteboards: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User not found.")
    }

    const whiteboards = await prisma.whiteboards.findMany({
        where: {
            userId,
        },
        select: {
            id: true,
            title: true,
            drawingData: true,
            thumbnail: true,
            user: {
                select: {
                    id: true,
                    username: true,
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    if (whiteboards.length === 0) {
        throw new ApiError(404, "Whiteboards failed to fetched.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                whiteboards,
                "Whiteboards fetched successfully."
            )
        )
})

const getWhiteboardById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { whiteboardId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User not found.")
    }

    const whiteboard = await prisma.whiteboards.findFirst({
        where: {
            id: whiteboardId as string,
            userId,
        },
        select: {
            id: true,
            title: true,
            drawingData: true,
            thumbnail: true,
            user: {
                select: {
                    id: true,
                    username: true,
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    if (!whiteboard) {
        throw new ApiError(404, "Whiteboard failed to fetched.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                whiteboard,
                "Whiteboard fetched successfully."
            )
        )
})

const deleteWhiteboardById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { whiteboardId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User not found.")
    }

    const deletedWhiteboard = await prisma.whiteboards.delete({
        where: {
            id: whiteboardId as string,
            userId,
        },
        select: {
            id: true,
            title: true,
            drawingData: true,
            thumbnail: true,
            user: {
                select: {
                    id: true,
                    username: true,
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    if (!deletedWhiteboard) {
        throw new ApiError(404, "Failed to delete whiteboard.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedWhiteboard,
                "Whiteboard deleted successfully."
            )
        )
})

const deleteWhiteboards: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id

    const user = await prisma.user.findFirst({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User not found.")
    }

    const deletedWhiteboards = await prisma.whiteboards.deleteMany({
        where: {
            userId,
        }
    })

    if (deletedWhiteboards.count === 0) {
        throw new ApiError(404, "Whiteboards failed to delete.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedWhiteboards,
                "Whiteboards deleted successfully."
            )
        )
})

export {
    createWhiteboard,
    getWhiteboardById,
    getAllWhiteboards,
    deleteWhiteboardById,
    deleteWhiteboards
}