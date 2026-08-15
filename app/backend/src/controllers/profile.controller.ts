import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import type { RequestHandler } from "express"
import { academicDetailsQuery } from "../queries/academicDetails.query.js"
import { userQuery } from "../queries/user.query.js"

const createProfile: RequestHandler = asyncHandler(async (req, res) => {
    const {
        collegeName,
        universityName,
        course,
        branch,
        year,
        semester,
        rollNumber
    } = req.body

    const userId = req.user?.id

    if (!userId) {
        throw new ApiError(401, "Unauthorized")
    }

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
        "User does not exist."
    )

    const profile = await academicDetailsQuery.upsert(
        {
            where: {
                userId: userId
            },
            update: {
                ...(collegeName !== undefined && { collegeName: collegeName || null }),
                ...(universityName !== undefined && { universityName: universityName || null }),
                ...(course !== undefined && { course: course || null }),
                ...(branch !== undefined && { branch: branch || null }),
                ...(year !== undefined && { year: year ? Number(year) : null }),
                ...(semester !== undefined && { semester: semester ? Number(semester) : null }),
                ...(rollNumber !== undefined && { rollNumber: rollNumber ? Number(rollNumber) : null })
            },
            create: {
                userId,
                collegeName: collegeName || null,
                universityName: universityName || null,
                course: course || null,
                branch: branch || null,
                year: year ? Number(year) : null,
                semester: semester ? Number(semester) : null,
                rollNumber: rollNumber ? Number(rollNumber) : null
            },
            select: {
                id: true,
                collegeName: true,
                universityName: true,
                course: true,
                branch: true,
                year: true,
                semester: true,
                rollNumber: true,
                userId: true,
                createdAt: true,
                updatedAt: true
            }
        }
    )

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                profile,
                "Academic details saved successfully"
            )
        )
})

const getProfile: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user?.id

    if (!userId) {
        throw new ApiError(401, "Unauthorized")
    }

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
        "User does not exist."
    )

    const profile = await academicDetailsQuery.findFirst(
        {
            where: {
                userId: userId
            },
            select: {
                id: true,
                collegeName: true,
                universityName: true,
                course: true,
                branch: true,
                year: true,
                semester: true,
                rollNumber: true,
                userId: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    select: {
                        id: true,
                        username: true,
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
                profile || null,
                "Profile fetched successfully"
            )
        )
})

const updateProfile: RequestHandler = asyncHandler(async (req, res) => {
    const {
        collegeName,
        universityName,
        course,
        branch,
        year,
        semester,
        rollNumber
    } = req.body

    const userId = req.user?.id

    if (!userId) {
        throw new ApiError(401, "Unauthorized")
    }

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
        "User does not exist."
    )

    const updatedProfile = await academicDetailsQuery.upsert(
        {
            where: {
                userId: userId,
            },
            update: {
                ...(collegeName !== undefined && { collegeName: collegeName || null }),
                ...(universityName !== undefined && { universityName: universityName || null }),
                ...(course !== undefined && { course: course || null }),
                ...(branch !== undefined && { branch: branch || null }),
                ...(year !== undefined && { year: year ? Number(year) : null }),
                ...(semester !== undefined && { semester: semester ? Number(semester) : null }),
                ...(rollNumber !== undefined && { rollNumber: rollNumber ? Number(rollNumber) : null })
            },
            create: {
                userId,
                collegeName: collegeName || null,
                universityName: universityName || null,
                course: course || null,
                branch: branch || null,
                year: year ? Number(year) : null,
                semester: semester ? Number(semester) : null,
                rollNumber: rollNumber ? Number(rollNumber) : null
            },
            select: {
                id: true,
                collegeName: true,
                universityName: true,
                course: true,
                branch: true,
                year: true,
                semester: true,
                rollNumber: true,
                userId: true,
                createdAt: true,
                updatedAt: true
            }
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedProfile,
                "Academic details successfully updated."
            )
        )
})

export {
    createProfile,
    getProfile,
    updateProfile,
}