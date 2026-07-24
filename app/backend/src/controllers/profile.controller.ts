import { logger } from "../utils/logger.js"
import { prisma } from '../db/prisma.js'
import { asyncHandler } from "../utils/async-handler.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { uploadFile, getFileUrl } from "../services/storage.service.js"
import type { RequestHandler } from "express"


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

    const profileId = await prisma.academicDetails.findFirst({
        where: {
            userId: userId
        },
        select: {
            id: true
        }
    })

    if (profileId) {
        throw new ApiError(409, "academic details already exists")
    }

    const profile = await prisma.academicDetails.create({
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
    })

    if (!profile) {
        throw new ApiError(404, "Failed to create academic details")
    }

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

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const profile = await prisma.academicDetails.findFirst({
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
            userId: true
        }
    })

    if (!profile) {
        throw new ApiError(404, "Academic details not found.")
    }

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

    const user = await prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const updatedProfile = await prisma.academicDetails.update({
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
    })

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