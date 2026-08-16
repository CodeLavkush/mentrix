import bcrypt from "bcrypt"
import { asyncHandler } from "../utils/async-handler.js"
import type { CookieOptions, RequestHandler } from "express"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import { uploadFile, getFileUrl, deleteFile, getFileMetadata, getFileStream } from "../services/storage.service.js"
import { redisClient } from "../db/redis.js"
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js"
import jwt from "jsonwebtoken"
import { generateAccessAndRefreshTokens } from "../utils/generate-tokens.js"
import { otpKey, generateOTP } from "../utils/generate-otp.js"
import { userQuery } from "../queries/user.query.js"

const registerUser: RequestHandler = asyncHandler(async (req, res) => {
    const { username, gender, age, email, password } = req.body


    await userQuery.mustNotExist({
        where: {
            OR: [
                { email },
                { username },
            ]
        },
        select: {
            id: true,
        },
    }, 409, "User already exists")

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

    const user = await userQuery.createOrThrow({
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
    }, 404, "Failed to create user")

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

    const createdUser = await userQuery.findFirstOrThrow({
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
    }, 500, "Something went wrong while registering a user")

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

    const user = await userQuery.findUniqueOrThrow({
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
    }, 401, "User does not exist")


    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user)

    const loggedInUser = await userQuery.findFirstOrThrow({
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
            avatarKey: true
        }
    }, 404, "User does not exist")

    const avatarUrl = loggedInUser.avatarKey
        ? await getFileUrl(loggedInUser.avatarKey)
        : null;

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
                user: {
                    ...loggedInUser,
                    avatarUrl,
                },
                accessToken,
                refreshToken,
            },
            "User logged in successfully"
        ))
})

const logoutUser: RequestHandler = asyncHandler(async (req, res) => {
    await userQuery.update({
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

    const user = await userQuery.findFirst({
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

    const avatarUrl = user?.avatarKey
        ? await getFileUrl(user.avatarKey)
        : null;

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: {
                        ...user,
                        avatarUrl
                    },
                    ...user,
                    avatarUrl
                },
                "Current user fetched successfully"
            )
        )
})

const updateUserAvatar: RequestHandler = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Avatar image file is required");
    }

    const userId = req.user!.id;
    const currentUser = await userQuery.findFirstOrThrow(
        {
            where: { id: userId },
            select: { id: true, avatarKey: true }
        },
        404,
        "User does not exist"
    );

    // Clean up previous avatar if exists
    if (currentUser.avatarKey) {
        try {
            await deleteFile(currentUser.avatarKey);
        } catch (err) {
            console.error("Failed to delete previous avatar:", err);
        }
    }

    const sanitizedOriginalName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const avatarKey = `users/avatars/${userId}-${Date.now()}-${sanitizedOriginalName}`;

    await uploadFile(
        avatarKey,
        req.file.buffer,
        req.file.mimetype
    );

    const updatedUser = await userQuery.update({
        where: { id: userId },
        data: { avatarKey },
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
    });

    const avatarUrl = await getFileUrl(avatarKey);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: {
                        ...updatedUser,
                        avatarUrl
                    },
                    ...updatedUser,
                    avatarUrl
                },
                "Avatar updated successfully"
            )
        );
});

const deleteUserAvatar: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const currentUser = await userQuery.findFirstOrThrow(
        {
            where: { id: userId },
            select: { id: true, avatarKey: true }
        },
        404,
        "User does not exist"
    );

    if (currentUser.avatarKey) {
        try {
            await deleteFile(currentUser.avatarKey);
        } catch (err) {
            console.error("Failed to delete avatar:", err);
        }
    }

    const updatedUser = await userQuery.update({
        where: { id: userId },
        data: { avatarKey: null },
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
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    user: {
                        ...updatedUser,
                        avatarUrl: null
                    },
                    ...updatedUser,
                    avatarUrl: null
                },
                "Avatar deleted successfully"
            )
        );
});

const getAvatarByUserId: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.params.userId as string;

    if (!userId) {
        throw new ApiError(400, "User ID is required");
    }

    const user = await userQuery.findFirst({
        where: { id: userId },
        select: { avatarKey: true }
    });

    if (!user || !user.avatarKey) {
        throw new ApiError(404, "Avatar not found");
    }

    try {
        const metadata = await getFileMetadata(user.avatarKey);
        const stream = await getFileStream(user.avatarKey);

        const contentType = (metadata as any)?.metaData?.['content-type'] || 'image/png';
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        stream.pipe(res);
    } catch {
        throw new ApiError(404, "Avatar file not found in storage");
    }
});

const verifyEmail: RequestHandler = asyncHandler(async (req, res) => {
    const { otp, email } = req.body

    const user = await userQuery.findUniqueOrThrow({
        where: {
            email
        },
        select: {
            id: true,
        }
    }, 404, "User does not exists")

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

    const verifiedUser = await userQuery.update({
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
    const user = await userQuery.findFirstOrThrow({
        where: {
            id: req.user?.id
        },
        select: {
            id: true,
            username: true,
            email: true,
            isEmailVerified: true,
        }
    }, 404, "User does not exist")

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

        const user = await userQuery.findFirstOrThrow({
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
        }, 401, "Invalid Refresh Token")

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user)

        await userQuery.update({
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
    updateUserAvatar,
    deleteUserAvatar,
    getAvatarByUserId,
}