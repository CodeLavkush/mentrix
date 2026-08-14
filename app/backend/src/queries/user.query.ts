import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class UserQuery extends BaseQuery {

    async create(
        query: Prisma.UserCreateArgs
    ) {
        return prisma.user.create(query);
    }


    async update(
        query: Prisma.UserUpdateArgs
    ) {
        return prisma.user.update(query);
    }


    async findUnique(
        query: Prisma.UserFindUniqueArgs
    ) {
        return prisma.user.findUnique(query);
    }


    async findFirst(
        query: Prisma.UserFindFirstArgs
    ) {
        return prisma.user.findFirst(query);
    }


    async findMany(
        query: Prisma.UserFindManyArgs
    ) {
        return prisma.user.findMany(query);
    }


    async createOrThrow(
        query: Prisma.UserCreateArgs,
        statusCode: number,
        message: string
    ) {
        return this.require(
            () => this.create(query),
            statusCode,
            message
        );
    }


    async findFirstOrThrow(
        query: Prisma.UserFindFirstArgs,
        statusCode: number,
        message: string
    ) {
        return this.require(
            () => this.findFirst(query),
            statusCode,
            message
        );
    }


    async findUniqueOrThrow(
        query: Prisma.UserFindUniqueArgs,
        statusCode: number,
        message: string
    ) {
        return this.require(
            () => this.findUnique(query),
            statusCode,
            message
        );
    }


    async mustNotExist(
        query: Prisma.UserFindFirstArgs,
        statusCode: number,
        message: string
    ) {
        return this.forbid(
            () => this.findFirst(query),
            statusCode,
            message
        );
    }
}

export const userQuery = new UserQuery();