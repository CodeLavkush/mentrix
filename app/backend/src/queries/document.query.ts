import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class DocumentQuery extends BaseQuery {

    // -------------------------
    // Queries
    // -------------------------

    async create(
        query: Prisma.DocumentsCreateArgs
    ) {
        return prisma.documents.create(query);
    }


    async update(
        query: Prisma.DocumentsUpdateArgs
    ) {
        return prisma.documents.update(query);
    }


    async findUnique(
        query: Prisma.DocumentsFindUniqueArgs
    ) {
        return prisma.documents.findUnique(query);
    }


    async findFirst(
        query: Prisma.DocumentsFindFirstArgs
    ) {
        return prisma.documents.findFirst(query);
    }


    async findMany(
        query: Prisma.DocumentsFindManyArgs
    ) {
        return prisma.documents.findMany(query);
    }


    async delete(
        query: Prisma.DocumentsDeleteArgs
    ) {
        return prisma.documents.delete(query);
    }


    async deleteMany(
        query: Prisma.DocumentsDeleteManyArgs
    ) {
        return prisma.documents.deleteMany(query);
    }


    // -------------------------
    // Checks
    // -------------------------

    async createOrThrow(
        query: Prisma.DocumentsCreateArgs,
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
        query: Prisma.DocumentsFindFirstArgs,
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
        query: Prisma.DocumentsFindUniqueArgs,
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
        query: Prisma.DocumentsFindFirstArgs,
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

export const documentQuery = new DocumentQuery();