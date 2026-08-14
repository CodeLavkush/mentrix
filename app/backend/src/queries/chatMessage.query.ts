import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class ChatMessageQuery extends BaseQuery {

    // -------------------------
    // Queries
    // -------------------------

    async create(
        query: Prisma.ChatMessagesCreateArgs
    ) {
        return prisma.chatMessages.create(query);
    }


    async update(
        query: Prisma.ChatMessagesUpdateArgs
    ) {
        return prisma.chatMessages.update(query);
    }


    async findUnique(
        query: Prisma.ChatMessagesFindUniqueArgs
    ) {
        return prisma.chatMessages.findUnique(query);
    }


    async findFirst(
        query: Prisma.ChatMessagesFindFirstArgs
    ) {
        return prisma.chatMessages.findFirst(query);
    }


    async findMany(
        query: Prisma.ChatMessagesFindManyArgs
    ) {
        return prisma.chatMessages.findMany(query);
    }


    async delete(
        query: Prisma.ChatMessagesDeleteArgs
    ) {
        return prisma.chatMessages.delete(query);
    }


    async deleteMany(
        query: Prisma.ChatMessagesDeleteManyArgs
    ) {
        return prisma.chatMessages.deleteMany(query);
    }


    // -------------------------
    // Checks
    // -------------------------

    async createOrThrow(
        query: Prisma.ChatMessagesCreateArgs,
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
        query: Prisma.ChatMessagesFindFirstArgs,
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
        query: Prisma.ChatMessagesFindUniqueArgs,
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
        query: Prisma.ChatMessagesFindFirstArgs,
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

export const chatMessageQuery = new ChatMessageQuery();