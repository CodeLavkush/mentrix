import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class QuizAttemptQuery extends BaseQuery {

    async create(query: Prisma.QuizAttemptsCreateArgs) {
        return prisma.quizAttempts.create(query);
    }

    async update(query: Prisma.QuizAttemptsUpdateArgs) {
        return prisma.quizAttempts.update(query);
    }

    async findUnique(query: Prisma.QuizAttemptsFindUniqueArgs) {
        return prisma.quizAttempts.findUnique(query);
    }

    async findFirst(query: Prisma.QuizAttemptsFindFirstArgs) {
        return prisma.quizAttempts.findFirst(query);
    }

    async findMany(query: Prisma.QuizAttemptsFindManyArgs) {
        return prisma.quizAttempts.findMany(query);
    }

    async delete(query: Prisma.QuizAttemptsDeleteArgs) {
        return prisma.quizAttempts.delete(query);
    }

    async deleteMany(query: Prisma.QuizAttemptsDeleteManyArgs) {
        return prisma.quizAttempts.deleteMany(query);
    }

    async createOrThrow(
        query: Prisma.QuizAttemptsCreateArgs,
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
        query: Prisma.QuizAttemptsFindFirstArgs,
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
        query: Prisma.QuizAttemptsFindUniqueArgs,
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
        query: Prisma.QuizAttemptsFindFirstArgs,
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

export const quizAttemptQuery = new QuizAttemptQuery();