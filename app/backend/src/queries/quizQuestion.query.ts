import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class QuizQuestionQuery extends BaseQuery {

    async create(query: Prisma.QuizQuestionsCreateArgs) {
        return prisma.quizQuestions.create(query);
    }

    async update(query: Prisma.QuizQuestionsUpdateArgs) {
        return prisma.quizQuestions.update(query);
    }

    async findUnique(query: Prisma.QuizQuestionsFindUniqueArgs) {
        return prisma.quizQuestions.findUnique(query);
    }

    async findFirst(query: Prisma.QuizQuestionsFindFirstArgs) {
        return prisma.quizQuestions.findFirst(query);
    }

    async findMany(query: Prisma.QuizQuestionsFindManyArgs) {
        return prisma.quizQuestions.findMany(query);
    }

    async delete(query: Prisma.QuizQuestionsDeleteArgs) {
        return prisma.quizQuestions.delete(query);
    }

    async deleteMany(query: Prisma.QuizQuestionsDeleteManyArgs) {
        return prisma.quizQuestions.deleteMany(query);
    }

    async createOrThrow(
        query: Prisma.QuizQuestionsCreateArgs,
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
        query: Prisma.QuizQuestionsFindFirstArgs,
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
        query: Prisma.QuizQuestionsFindUniqueArgs,
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
        query: Prisma.QuizQuestionsFindFirstArgs,
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

export const quizQuestionQuery = new QuizQuestionQuery();