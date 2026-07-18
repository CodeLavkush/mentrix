import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { prisma } from "../db/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

interface DecodedToken extends JwtPayload {
    id: string;
}

export const verifyJWT: RequestHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        try {
            const decoded = jwt.verify(
                token,
                process.env.ACCESS_TOKEN_SECRET as string
            ) as DecodedToken;

            const user = await prisma.user.findUnique({
                where: {
                    id: decoded.id,
                },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    fullName: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,
                    // Exclude password, refreshToken, etc.
                },
            });

            if (!user) {
                throw new ApiError(401, "Invalid access token");
            }

            req.user = user;
            next();
        } catch {
            throw new ApiError(401, "Invalid access token");
        }
    }
);