import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class FlashcardProgressQuery extends BaseQuery {

    async create(query: Prisma.FlashcardProgressCreateArgs) {
        return prisma.flashcardProgress.create(query);
    }

    async update(query: Prisma.FlashcardProgressUpdateArgs) {
        return prisma.flashcardProgress.update(query);
    }

    async findUnique(query: Prisma.FlashcardProgressFindUniqueArgs) {
        return prisma.flashcardProgress.findUnique(query);
    }

    async findFirst(query: Prisma.FlashcardProgressFindFirstArgs) {
        return prisma.flashcardProgress.findFirst(query);
    }

    async findMany(query: Prisma.FlashcardProgressFindManyArgs) {
        return prisma.flashcardProgress.findMany(query);
    }

    async delete(query: Prisma.FlashcardProgressDeleteArgs) {
        return prisma.flashcardProgress.delete(query);
    }

    async deleteMany(query: Prisma.FlashcardProgressDeleteManyArgs) {
        return prisma.flashcardProgress.deleteMany(query);
    }

    async createOrThrow(
        query: Prisma.FlashcardProgressCreateArgs,
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
        query: Prisma.FlashcardProgressFindFirstArgs,
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
        query: Prisma.FlashcardProgressFindUniqueArgs,
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
        query: Prisma.FlashcardProgressFindFirstArgs,
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

export const flashcardProgressQuery =
    new FlashcardProgressQuery();