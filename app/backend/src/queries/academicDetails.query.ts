import { prisma } from "../db/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { BaseQuery } from "./base.query.js";

class AcademicDetailsQuery extends BaseQuery {

    async create(query: Prisma.AcademicDetailsCreateArgs) {
        return prisma.academicDetails.create(query);
    }

    async update(query: Prisma.AcademicDetailsUpdateArgs) {
        return prisma.academicDetails.update(query);
    }

    async findUnique(query: Prisma.AcademicDetailsFindUniqueArgs) {
        return prisma.academicDetails.findUnique(query);
    }

    async findFirst(query: Prisma.AcademicDetailsFindFirstArgs) {
        return prisma.academicDetails.findFirst(query);
    }

    async findMany(query: Prisma.AcademicDetailsFindManyArgs) {
        return prisma.academicDetails.findMany(query);
    }

    async delete(query: Prisma.AcademicDetailsDeleteArgs) {
        return prisma.academicDetails.delete(query);
    }

    async deleteMany(query: Prisma.AcademicDetailsDeleteManyArgs) {
        return prisma.academicDetails.deleteMany(query);
    }

    async createOrThrow(
        query: Prisma.AcademicDetailsCreateArgs,
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
        query: Prisma.AcademicDetailsFindFirstArgs,
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
        query: Prisma.AcademicDetailsFindUniqueArgs,
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
        query: Prisma.AcademicDetailsFindFirstArgs,
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

export const academicDetailsQuery = new AcademicDetailsQuery();