import { ApiResponse } from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"
import type { RequestHandler } from "express"
import { uploadFile, getFileMetadata, fileExists, deleteFile, getFileStream } from "../services/storage.service.js"
import { ApiError } from "../utils/api-error.js"
import { documentProcessingQueue } from "../queues/document.queue.js"
import { randomUUID } from "crypto"
import { serializeBigInt } from "../utils/serialize.js"
import { userQuery } from "../queries/user.query.js"
import { documentQuery } from "../queries/document.query.js"


const uploadDocument: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id

    await userQuery.findFirstOrThrow({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    }, 404, "User does not exists")

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

    const uploadedDocument = await documentQuery.createOrThrow(
        {
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
        },
        409,
        "Something went wrong while uploading the document"
    )

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
                serializeBigInt(uploadedDocument),
                "Document uploaded Successfully"
            )
        )
})

const getDocumentsById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id

    await userQuery.findFirstOrThrow({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    }, 404, "User does not exists")

    const documents = await documentQuery.findMany(
        {
            where: {
                userId,
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
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                serializeBigInt(documents || []),
                "Documents fetched Successfully"
            )
        )
})

const deleteDocumentById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params

    await userQuery.findFirstOrThrow({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    }, 404, "User does not exists")

    const document = await documentQuery.findFirstOrThrow({
        where: {
            id: documentId as string,
            userId,
        },
        select: {
            id: true,
            storagePath: true
        }
    }, 404, "Document does not exists")

    const documentExists = await fileExists(document.storagePath)

    if (!documentExists) {
        throw new ApiError(404, "Document does not exists in storage")
    }

    await deleteFile(document.storagePath)
    const deletedDocument = await documentQuery.delete({
        where: {
            id: documentId as string
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

    if (!deletedDocument) {
        throw new ApiError(409, "Something went wrong while deleting the document")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                serializeBigInt(deletedDocument),
                "Document deleted Successfully"
            )
        )
})

const downloadDocumentById: RequestHandler = asyncHandler(async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user?.id;


    await userQuery.findFirstOrThrow({
        where: {
            id: userId,
        },
        select: {
            id: true
        }
    }, 404, "User does not exists")


    const document = await documentQuery.findFirstOrThrow(
        {
            where: {
                id: documentId as string,
                userId,
            },
            select: {
                id: true,
                fileName: true,
                storagePath: true,
            }
        },
        404,
        "Document does not exists"
    )

    const metadata = await getFileMetadata(document.storagePath);
    const fileStream = await getFileStream(document.storagePath);

    res.setHeader(
        "Content-Type",
        metadata.metaData["content-type"] ?? "application/octet-stream",
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.fileName}"`,
    );

    fileStream.on("error", (error: any) => {
        console.error(error);

        if (!res.headersSent) {
            throw new ApiError(500, "Failed to download document");
        }
    });

    fileStream.pipe(res);
})

export {
    uploadDocument,
    getDocumentsById,
    deleteDocumentById,
    downloadDocumentById
}