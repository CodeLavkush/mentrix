import { prisma } from '../db/prisma.js'
import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { type RequestHandler } from "express"
import { uploadFile, ensureBucket, getFileStream } from '../services/storage.service.js'
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

    let parsedDrawingData: InputJsonValue = {};
    if (typeof drawingData === "string") {
        try {
            parsedDrawingData = JSON.parse(drawingData);
        } catch {
            parsedDrawingData = { image: drawingData };
        }
    } else if (drawingData && typeof drawingData === "object") {
        parsedDrawingData = drawingData as InputJsonValue;
    }

    let thumbnail: string | null = null;

    if (req.file) {
        thumbnail = `users/whiteboard/${userId}/${Date.now()}-${req.file.originalname || "thumbnail.png"}`;

        try {
            await ensureBucket();
            await uploadFile(
                thumbnail,
                req.file.buffer,
                req.file.mimetype || "image/png",
            );
        } catch (err) {
            console.error("Failed to upload thumbnail to MinIO:", err);
            thumbnail = null;
        }
    } else if (req.body.thumbnail && typeof req.body.thumbnail === "string" && req.body.thumbnail.startsWith("data:image")) {
        try {
            const matches = req.body.thumbnail.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                thumbnail = `users/whiteboard/${userId}/${Date.now()}-thumbnail.png`;
                await ensureBucket();
                await uploadFile(thumbnail, buffer, mimeType);
            }
        } catch (err) {
            console.error("Failed to upload base64 thumbnail:", err);
        }
    }

    const whiteboard = await whiteboardQuery.createOrThrow(
        {
            data: {
                userId,
                title: title as string,
                drawingData: parsedDrawingData,
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

    const rawData = whiteboard.drawingData as any;
    const inlineImage = typeof rawData === 'string' && rawData.startsWith('data:image')
        ? rawData
        : rawData?.image;

    const result = {
        ...whiteboard,
        thumbnailUrl: `/api/v1/whiteboard/${whiteboard.id}/thumbnail`,
        thumbnailPreview: inlineImage || `/api/v1/whiteboard/${whiteboard.id}/thumbnail`,
    };

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                result,
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
        orderBy: {
            updatedAt: "desc"
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

    const whiteboardsWithUrls = (whiteboards || []).map((wb) => {
        const rawData = wb.drawingData as any;
        const inlineImage = typeof rawData === 'string' && rawData.startsWith('data:image')
            ? rawData
            : rawData?.image;

        return {
            ...wb,
            thumbnailUrl: `/api/v1/whiteboard/${wb.id}/thumbnail`,
            thumbnailPreview: inlineImage || `/api/v1/whiteboard/${wb.id}/thumbnail`,
        };
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                whiteboardsWithUrls,
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

    const rawData = whiteboard.drawingData as any;
    const inlineImage = typeof rawData === 'string' && rawData.startsWith('data:image')
        ? rawData
        : rawData?.image;

    const result = {
        ...whiteboard,
        thumbnailUrl: `/api/v1/whiteboard/${whiteboard.id}/thumbnail`,
        thumbnailPreview: inlineImage || `/api/v1/whiteboard/${whiteboard.id}/thumbnail`,
    };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "Whiteboard fetched successfully."
            )
        )
})

const getWhiteboardThumbnail: RequestHandler = asyncHandler(async (req, res) => {
    const whiteboardId = req.params.whiteboardId as string

    const whiteboard = await whiteboardQuery.findFirst({
        where: { id: whiteboardId },
        select: { id: true, thumbnail: true, drawingData: true }
    })

    if (!whiteboard) {
        throw new ApiError(404, "Whiteboard not found")
    }

    if (whiteboard.thumbnail) {
        try {
            const stream = await getFileStream(whiteboard.thumbnail)
            res.setHeader("Content-Type", "image/png")
            res.setHeader("Cache-Control", "public, max-age=86400")
            return stream.pipe(res)
        } catch (err) {
            console.error("Failed to stream thumbnail from MinIO:", err)
        }
    }

    // Fallback if image data exists in drawingData
    const rawData = whiteboard.drawingData as any
    const base64Data = typeof rawData === 'string' && rawData.startsWith('data:image')
        ? rawData
        : rawData?.image

    if (base64Data && typeof base64Data === 'string' && base64Data.startsWith('data:image')) {
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        if (matches && matches[1] && matches[2]) {
            const mimeType = matches[1]
            const buffer = Buffer.from(matches[2], 'base64')
            res.setHeader("Content-Type", mimeType)
            res.setHeader("Cache-Control", "public, max-age=86400")
            return res.send(buffer)
        }
    }

    return res.status(404).json(new ApiResponse(404, null, "Thumbnail not found"))
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
    getWhiteboardThumbnail,
    deleteWhiteboardById,
    deleteWhiteboards
}