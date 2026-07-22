import type { User } from "../types/user/index.js"
import type { StringValue } from "ms"
import jwt from "jsonwebtoken"
import { prisma } from '../db/prisma.js'
import { ApiError } from "../utils/api-error.js"

function generateAccessToken(user: User): string {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY as StringValue,
        }
    )
}

function generateRefreshToken(user: User): string {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
        },
        process.env.REFRESH_TOKEN_SECRET!,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY as StringValue,
        }
    )
}


export async function generateAccessAndRefreshTokens(user: User) {
    try {
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                refreshToken: refreshToken,
            },
        });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access token"
        )
    }
}