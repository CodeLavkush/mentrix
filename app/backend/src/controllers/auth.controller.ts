import bcrypt from "bcrypt"
import { logger } from "../utils/logger.js"
import { prisma } from '../db/prisma.js'
import { asyncHandler } from "../utils/async-handler.js"
import type { CookieOptions, RequestHandler } from "express"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { uploadFile, getFileUrl } from "../services/storage.service.js"
import { redisClient } from "../db/redis.js"
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js"
import jwt from "jsonwebtoken"
import { generateAccessAndRefreshTokens } from "../utils/generate-tokens.js"
import { otpKey, generateOTP } from "../utils/generate-otp.js"


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

    if (existingUser) {
        throw new ApiError(409, 'User already exists')
    }

    let avatarKey: string | null = null;

    if (req.file) {
        avatarKey = `users/avatars/${Date.now()}-${req.file.originalname}`;

        await uploadFile(
            avatarKey,
            req.file.buffer,
            req.file.mimetype,
        );
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            username,
            gender,
            age: Number(age),
            email,
            password: hashedPassword,
            isEmailVerified: false,
            refreshToken: "",
            avatarKey,
        },
        select: {
            id: true,
            username: true,
            gender: true,
            age: true,
            email: true,
            isEmailVerified: true,
            avatarKey: true,
        }
    })

    const avatarUrl = user.avatarKey
        ? await getFileUrl(user.avatarKey)
        : null;

    const { otp, otpExpiry } = generateOTP();

    await redisClient.set(otpKey(user.email), otp, 'EX', otpExpiry)

    await sendEmail({
        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(user.username, `${otp}`),
    })

    const createdUser = await prisma.user.findUnique({
        where: {
            id: user.id,
        },
        select: {
            id: true,
            username: true,
            gender: true,
            age: true,
            email: true,
            isEmailVerified: true,
        }
    })

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res
        .status(201)
        .json(new ApiResponse(
            200,
            {
                ...createdUser,
                avatarUrl,
            },
            "User registered successfully. Please check your email for the OTP to verify your account."
        ))
})


const loginUser: RequestHandler = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required")
    }

    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            id: true,
            password: true,
            isEmailVerified: true,
            username: true,
            gender: true,
            age: true,
            email: true,
            refreshToken: true
        }
    })

    if (!user) {
        throw new ApiError(401, "User does not exist")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user)

    const loggedInUser = await prisma.user.findFirst({
        where: {
            id: user.id
        },
        select: {
            id: true,
            username: true,
            email: true,
            gender: true,
            age: true,
            isEmailVerified: true,
        }
    })

    const options: CookieOptions = {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        ))
})

const logoutUser: RequestHandler = asyncHandler(async (req, res) => {
    await prisma.user.update({
        where: {
            id: req.user!.id
        },
        data: {
            refreshToken: null
        }
    })

    const options: CookieOptions = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(
            200,
            {},
            "User logged out successfully"
        ))
})

const getCurrentUser: RequestHandler = asyncHandler(async (req, res) => {

    const user = await prisma.user.findFirst({
        where: {
            id: req.user!.id
        },
        select: {
            id: true,
            username: true,
            email: true,
            gender: true,
            age: true,
            avatarKey: true,
            isEmailVerified: true,
            updatedAt: true,
            createdAt: true,
        }
    })

    const avatarUrl = await getFileUrl(user?.avatarKey!)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    ...user,
                    avatarUrl
                },
                "Current user fetched successfully"
            )
        )
})

const verifyEmail: RequestHandler = asyncHandler(async (req, res) => {
    const { otp, email } = req.body

    const user = await prisma.user.findFirst({
        where: {
            email
        },
        select: {
            id: true,
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    if (!otp) {
        throw new ApiError(400, "OTP is missing")
    }

    const savedOtp = await redisClient.get(otpKey(email))

    if (!savedOtp) {
        throw new ApiError(400, "OTP is expired or not found")
    }

    if (savedOtp !== otp) {
        throw new ApiError(400, "Invalid OTP")
    }

    const verifiedUser = await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            isEmailVerified: true
        },
        select: {
            id: true,
            username: true,
            isEmailVerified: true
        }
    })

    await redisClient.del(otpKey(email))

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            verifiedUser,
            "Email is Verified"
        ))
})

const resendEmailVerification: RequestHandler = asyncHandler(async (req, res) => {
    const user = await prisma.user.findFirst({
        where: {
            id: req.user?.id
        },
        select: {
            id: true,
            username: true,
            email: true,
            isEmailVerified: true,
        }
    })

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    if (user.isEmailVerified) {
        throw new ApiError(404, "Email is already verified")
    }

    const { otp, otpExpiry } = generateOTP()

    await redisClient.set(otpKey(user.email), otp, "EX", otpExpiry)


    await sendEmail(
        {
            email: user.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${otp}`
            )
        }
    )

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            {},
            `Mail has been sent to ${user.email}`
        ))
})

const refreshAccessToken: RequestHandler = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Access")
    }

    try {

        const decodedToken: any = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET!)

        const user = await prisma.user.findFirst({
            where: {
                id: decodedToken?.id
            },
            select: {
                id: true,
                username: true,
                email: true,
                gender: true,
                age: true,
                isEmailVerified: true,
                refreshToken: true,
            }
        })

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user)

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                refreshToken: newRefreshToken
            }
        })


        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(
                200,
                {
                    accessToken,
                    refreshToken: newRefreshToken,
                },
                "Access Token refreshed"
            ))
    } catch (error) {
        throw new ApiError(401, "Invalid refresh Token")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
}