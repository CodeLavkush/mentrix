import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class QuizQuery extends BaseQuery {

    async create(query: Prisma.QuizzesCreateArgs) {
        return prisma.quizzes.create(query);
    }

    async update(query: Prisma.QuizzesUpdateArgs) {
        return prisma.quizzes.update(query);
    }

    async findUnique(query: Prisma.QuizzesFindUniqueArgs) {
        return prisma.quizzes.findUnique(query);
    }

    async findFirst(query: Prisma.QuizzesFindFirstArgs) {
        return prisma.quizzes.findFirst(query);
    }

    async findMany(query: Prisma.QuizzesFindManyArgs) {
        return prisma.quizzes.findMany(query);
    }

    async delete(query: Prisma.QuizzesDeleteArgs) {
        return prisma.quizzes.delete(query);
    }

    async deleteMany(query: Prisma.QuizzesDeleteManyArgs) {
        return prisma.quizzes.deleteMany(query);
    }

    async createOrThrow(
        query: Prisma.QuizzesCreateArgs,
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
        query: Prisma.QuizzesFindFirstArgs,
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
        query: Prisma.QuizzesFindUniqueArgs,
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
        query: Prisma.QuizzesFindFirstArgs,
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

export const quizQuery = new QuizQuery();