import bcrypt from "bcrypt"
import { logger } from "../utils/logger.js"
import { prisma } from '../db/prisma.js'
import { asyncHandler } from "../utils/async-handler.js"
import type { RequestHandler } from "express"
import { ApiError } from "../utils/api-error.js"

const registerUser: RequestHandler = asyncHandler(async (req, res) => {
    const { username, gender, age, email, password } = req.body

    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { username },
            ]
        },
        select: {
            id: true,
        },
    })

    if (!existingUser) {
        throw new ApiError(409, 'User already exists')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            username,
            gender,
            age,
            email,
            password: hashedPassword,
            isEmailVerified: false,
            refreshToken: "",
            avatar: "",
        },
        select: {
            id: true,
            username: true,
            gender: true,
            age: true,
            email: true,
            isEmailVerified: true,
            avatar: true
        }
    })
})