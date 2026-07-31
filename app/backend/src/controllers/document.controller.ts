import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import type { RequestHandler } from "express"
import { uploadFile, getFileMetadata } from "../services/storage.service.js"
import { prisma } from "../db/prisma.js"
import { ApiError } from "../utils/api-error.js"
import { documentProcessingQueue } from "../queues/document.queue.js"
import { randomUUID } from "crypto"
import { serializeBigInt } from "../utils/serialize.js"


const uploadDocument: RequestHandler = asyncHandler(async (req, res) => {
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
        throw new ApiError(404, "User does not exists")
    }

    const document = req.file

    if (!document) {
        throw new ApiError(404, "File not found")
    }

    let documentKey: string | null = null

    documentKey = `users/documents/${userId}/${randomUUID()}-${document.originalname}`

    const storagePath = await uploadFile(
        documentKey,
        document.buffer,
        document.mimetype,
    )

    const fileMetaData = await getFileMetadata(storagePath)

    const uploadedDocument = await prisma.documents.create({
        data: {
            userId,
            fileName: document.originalname,
            fileType: document.mimetype,
            fileSize: fileMetaData.size,
            storagePath: storagePath,
            uploadStatus: "PROCESSING"
        },
        select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            uploadStatus: true,
            user: {
                select: {
                    id: true,
                    username: true
                }
            }
        }
    })

    if (!uploadedDocument) {
        throw new ApiError(409, "Something went wrong while uploading the document")
    }

    await documentProcessingQueue.add(
        "process-document",
        {
            documentId: uploadedDocument.id,
            userId,
            storagePath,
        },
        {
            attempts: 3,

            backoff: {
                type: "exponential",
                delay: 120000,
            },

            removeOnComplete: 100,
            removeOnFail: 500
        }
    )

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                serializeBigInt(uploadDocument),
                "Document uploaded Successfully"
            )
        )
})

export {
    uploadDocument
}