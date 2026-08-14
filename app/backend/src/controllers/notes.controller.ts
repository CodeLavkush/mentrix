import { prisma } from '../db/prisma.js'
import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { type RequestHandler } from "express"


const createNote: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params
    const { title } = req.body

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const document = await prisma.documents.findFirst({
        where: {
            id: documentId as string,
        },
        select: {
            id: true
        }
    })

    if (!document) {
        throw new ApiError(404, "Document does not exists.")
    }

    const response = await fetch(
        `${process.env.AI_SERVICE_URL}/api/v1/internal/notes`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                document_Id: document.id
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

    if (!result.content) {
        throw new ApiError(404, "Notes cannot be generated.")
    }

    const note = await prisma.notes.create({
        data: {
            userId,
            documentId: document.id,
            title: title as string,
            content: result.content,
        },
        select: {
            id: true,
            title: true,
            content: true,
            documentId: true,
            user: {
                select: {
                    id: true,
                    username: true
                }
            },
            createdAt: true,
            updatedAt: true

        }
    })

    if (!note) {
        throw new ApiError(404, "Note not found.")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                note,
                "Note created successfully."
            )
        )
})

const getAllNotes: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const document = await prisma.documents.findFirst({
        where: {
            id: documentId as string,
        },
        select: {
            id: true
        }
    })

    if (!document) {
        throw new ApiError(404, "Document does not exists.")
    }

    const notes = await prisma.notes.findMany({
        where: {
            userId,
            documentId: document.id
        },
        select: {
            id: true,
            title: true,
            content: true,
            documents: {
                select: {
                    id: true,
                    fileName: true,
                    fileSize: true,
                    fileType: true,
                }
            },
            user: {
                select: {
                    id: true,
                    username: true
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    if (notes.length === 0) {
        throw new ApiError(404, "Notes not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notes,
                "Notes fetched successfully."
            )
        )
})

const getNoteById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId, noteId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const document = await prisma.documents.findFirst({
        where: {
            id: documentId as string,
        },
        select: {
            id: true
        }
    })

    if (!document) {
        throw new ApiError(404, "Document does not exists.")
    }

    const note = await prisma.notes.findFirst({
        where: {
            id: noteId as string,
            userId,
            documentId: document.id,
        },
        select: {
            id: true,
            title: true,
            content: true,
            documents: {
                select: {
                    id: true,
                    fileName: true,
                    fileSize: true,
                    fileType: true,
                }
            },
            user: {
                select: {
                    id: true,
                    username: true
                }
            },
            createdAt: true,
            updatedAt: true
        }
    })

    if (!note) {
        throw new ApiError(404, "Note not found.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                note,
                "Note fetched successfully."
            )
        )
})

const deleteNoteById: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId, noteId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const document = await prisma.documents.findFirst({
        where: {
            id: documentId as string,
        },
        select: {
            id: true
        }
    })

    if (!document) {
        throw new ApiError(404, "Document does not exists.")
    }

    const deletedNote = await prisma.notes.delete({
        where: {
            id: noteId as string,
            documentId: document.id,
            userId
        },
        select: {
            id: true,
        }
    })

    if (!deletedNote) {
        throw new ApiError(404, "Failed to delete the note.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedNote,
                "Note deleted successfully."
            )
        )
})

const deleteAllNotes: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id
    const { documentId } = req.params

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists.")
    }

    const document = await prisma.documents.findFirst({
        where: {
            id: documentId as string,
        },
        select: {
            id: true
        }
    })

    if (!document) {
        throw new ApiError(404, "Document does not exists.")
    }

    const deletedNotes = await prisma.notes.deleteMany({
        where: {
            userId,
            documentId: document.id,
        }
    })

    if (deletedNotes.count === 0) {
        throw new ApiError(404, "Failed to delete notes.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedNotes,
                "Notes deleted successfully."
            )
        )
})

export {
    createNote,
    getAllNotes,
    getNoteById,
    deleteNoteById,
    deleteAllNotes,
}