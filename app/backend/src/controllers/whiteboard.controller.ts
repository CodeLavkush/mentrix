import { prisma } from '../db/prisma.js'
import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { type RequestHandler } from "express"
import { uploadFile } from '../services/storage.service.js'
import type { InputJsonValue } from '@prisma/client/runtime/client'
import { whiteboardQuery } from '../queries/whiteboard.query.js'
import { userQuery } from '../queries/user.query.js'


const createWhiteboard: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { title, drawingData } = req.body

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

    let thumbnail: string | null = null;

    if (req.file) {
        thumbnail = `users/whiteboard/${userId}/${Date.now()}-${req.file.originalname}`;

        await uploadFile(
            thumbnail,
            req.file.buffer,
            req.file.mimetype,
        );
    }

    const whiteboard = await whiteboardQuery.createOrThrow(
        {
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
        },
        404,
        "Whiteboard creation failed."
    )

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

    const whiteboards = await whiteboardQuery.findMany({
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

    const whiteboard = await whiteboardQuery.findFirstOrThrow(
        {
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
        },
        404,
        "Whiteboard failed to fetched."
    )

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

    const deletedWhiteboard = await whiteboardQuery.delete(
        {
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
        }
    )

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

    const deletedWhiteboards = await whiteboardQuery.deleteMany(
        {
            where: {
                userId,
            }
        }
    )

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