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

    const profileId = await academicDetailsQuery.findFirst(
        {
            where: {
                userId: userId
            },
            select: {
                id: true
            }
        }
    )

    if (profileId) {
        throw new ApiError(409, "academic details already exists")
    }

    const profile = await academicDetailsQuery.createOrThrow(
        {
            data: {
                collegeName,
                universityName,
                course,
                branch,
                year,
                semester,
                rollNumber,
                userId
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
                userId: true
            }
        },
        404,
        "Failed to create academic details"
    )

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                profile,
                "Academic details added successfully"
            )
        )

})

const getProfile: RequestHandler = asyncHandler(async (req, res) => {
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

    const profile = await academicDetailsQuery.findFirstOrThrow(
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
                user: {
                    select: {
                        id: true,
                        username: true,
                    }
                }
            }
        },
        404,
        "Academic details not found."
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                profile,
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

    const updatedProfile = await academicDetailsQuery.update(
        {
            where: {
                userId: userId,
            },
            data: {
                ...(collegeName !== undefined && { collegeName }),
                ...(universityName !== undefined && { universityName }),
                ...(course !== undefined && { course }),
                ...(branch !== undefined && { branch }),
                ...(year !== undefined && { year }),
                ...(semester !== undefined && { semester }),
                ...(rollNumber !== undefined && { rollNumber })
            },
            select: {
                id: true
            }
        }
    )

    if (!updatedProfile) {
        throw new ApiError(404, "Failed to update academic details")
    }

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