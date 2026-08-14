import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class WhiteboardQuery extends BaseQuery {

    async create(query: Prisma.WhiteboardsCreateArgs) {
        return prisma.whiteboards.create(query);
    }

    async update(query: Prisma.WhiteboardsUpdateArgs) {
        return prisma.whiteboards.update(query);
    }

    async findUnique(query: Prisma.WhiteboardsFindUniqueArgs) {
        return prisma.whiteboards.findUnique(query);
    }

    async findFirst(query: Prisma.WhiteboardsFindFirstArgs) {
        return prisma.whiteboards.findFirst(query);
    }

    async findMany(query: Prisma.WhiteboardsFindManyArgs) {
        return prisma.whiteboards.findMany(query);
    }

    async delete(query: Prisma.WhiteboardsDeleteArgs) {
        return prisma.whiteboards.delete(query);
    }

    async deleteMany(query: Prisma.WhiteboardsDeleteManyArgs) {
        return prisma.whiteboards.deleteMany(query);
    }

    async createOrThrow(
        query: Prisma.WhiteboardsCreateArgs,
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
        query: Prisma.WhiteboardsFindFirstArgs,
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
        query: Prisma.WhiteboardsFindUniqueArgs,
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
        query: Prisma.WhiteboardsFindFirstArgs,
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

export const whiteboardQuery = new WhiteboardQuery();