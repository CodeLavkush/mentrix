import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class FlashcardSetQuery extends BaseQuery {

    async create(query: Prisma.FlashcardSetsCreateArgs) {
        return prisma.flashcardSets.create(query);
    }

    async update(query: Prisma.FlashcardSetsUpdateArgs) {
        return prisma.flashcardSets.update(query);
    }

    async findUnique(query: Prisma.FlashcardSetsFindUniqueArgs) {
        return prisma.flashcardSets.findUnique(query);
    }

    async findFirst(query: Prisma.FlashcardSetsFindFirstArgs) {
        return prisma.flashcardSets.findFirst(query);
    }

    async findMany(query: Prisma.FlashcardSetsFindManyArgs) {
        return prisma.flashcardSets.findMany(query);
    }

    async delete(query: Prisma.FlashcardSetsDeleteArgs) {
        return prisma.flashcardSets.delete(query);
    }

    async deleteMany(query: Prisma.FlashcardSetsDeleteManyArgs) {
        return prisma.flashcardSets.deleteMany(query);
    }

    async createOrThrow(
        query: Prisma.FlashcardSetsCreateArgs,
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
        query: Prisma.FlashcardSetsFindFirstArgs,
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
        query: Prisma.FlashcardSetsFindUniqueArgs,
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
        query: Prisma.FlashcardSetsFindFirstArgs,
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

export const flashcardSetQuery = new FlashcardSetQuery();