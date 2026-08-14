import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class FlashcardQuery extends BaseQuery {

    async create(query: Prisma.FlashcardsCreateArgs) {
        return prisma.flashcards.create(query);
    }

    async update(query: Prisma.FlashcardsUpdateArgs) {
        return prisma.flashcards.update(query);
    }

    async findUnique(query: Prisma.FlashcardsFindUniqueArgs) {
        return prisma.flashcards.findUnique(query);
    }

    async findFirst(query: Prisma.FlashcardsFindFirstArgs) {
        return prisma.flashcards.findFirst(query);
    }

    async findMany(query: Prisma.FlashcardsFindManyArgs) {
        return prisma.flashcards.findMany(query);
    }

    async delete(query: Prisma.FlashcardsDeleteArgs) {
        return prisma.flashcards.delete(query);
    }

    async deleteMany(query: Prisma.FlashcardsDeleteManyArgs) {
        return prisma.flashcards.deleteMany(query);
    }

    async createOrThrow(
        query: Prisma.FlashcardsCreateArgs,
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
        query: Prisma.FlashcardsFindFirstArgs,
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
        query: Prisma.FlashcardsFindUniqueArgs,
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
        query: Prisma.FlashcardsFindFirstArgs,
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

export const flashcardQuery = new FlashcardQuery();