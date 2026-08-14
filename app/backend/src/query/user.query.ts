import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { ApiError } from "../utils/api-error.js";



class UserQuery {
    // queries
    async update(query: Prisma.UserUpdateArgs) {
        return prisma.user.update(query)
    }
    async create(query: Prisma.UserCreateArgs) {
        return prisma.user.create(query)
    }
    async findUnique(query: Prisma.UserFindUniqueArgs) {
        return prisma.user.findUnique(query)
    }
    async findFirst(query: Prisma.UserFindFirstArgs) {
        return prisma.user.findFirst(query)
    }

    // checks 
    async isUserCreated(query: Prisma.UserCreateArgs, statusCode: number, message: string) {
        const createdUser = await this.create(query)

        if (!createdUser) {
            throw new ApiError(statusCode, message)
        }

        return createdUser
    }

    async isUserExists(query: Prisma.UserFindFirstArgs, statusCode: number, message: string) {
        const existingUser = await this.findFirst(query)

        if (!existingUser) {
            throw new ApiError(statusCode, message)
        }

        return existingUser
    }

    async isUserAlreadyExists(query: Prisma.UserFindFirstArgs, statusCode: number, message: string) {
        const existingUser = await this.findFirst(query)

        if (existingUser) {
            throw new ApiError(statusCode, message)
        }
    }

    async isUserUnique(query: Prisma.UserFindUniqueArgs, statusCode: number, message: string) {
        const user = await this.findUnique(query)

        if (!user) {
            throw new ApiError(statusCode, message)
        }

        return user
    }
}

export const userQuery = new UserQuery()