import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class NoteQuery extends BaseQuery {

    async create(query: Prisma.NotesCreateArgs) {
        return prisma.notes.create(query);
    }

    async update(query: Prisma.NotesUpdateArgs) {
        return prisma.notes.update(query);
    }

    async findUnique(query: Prisma.NotesFindUniqueArgs) {
        return prisma.notes.findUnique(query);
    }

    async findFirst(query: Prisma.NotesFindFirstArgs) {
        return prisma.notes.findFirst(query);
    }

    async findMany(query: Prisma.NotesFindManyArgs) {
        return prisma.notes.findMany(query);
    }

    async delete(query: Prisma.NotesDeleteArgs) {
        return prisma.notes.delete(query);
    }

    async deleteMany(query: Prisma.NotesDeleteManyArgs) {
        return prisma.notes.deleteMany(query);
    }

    async createOrThrow(
        query: Prisma.NotesCreateArgs,
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
        query: Prisma.NotesFindFirstArgs,
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
        query: Prisma.NotesFindUniqueArgs,
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
        query: Prisma.NotesFindFirstArgs,
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

export const noteQuery = new NoteQuery();