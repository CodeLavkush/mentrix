import { jest } from "@jest/globals";
import type { MockCreatedUser, MockCreatedUserWithoutAvatar } from "../../types/test/index.js";
import type { Mock } from "node:test";

export const mockFindFirst: Mock<any> = jest.fn<
    (args: unknown) => Promise<{ id: string } | null>
>();

export const mockCreate: Mock<any> = jest.fn<
    (args: unknown) => Promise<MockCreatedUser>
>();

export const mockFindUnique: Mock<any> = jest.fn<
    (args: unknown) => Promise<
        MockCreatedUserWithoutAvatar | null
    >
>();

export const mockUpdate: Mock<any> = jest.fn();

export function setupPrismaMock() {
    jest.unstable_mockModule(
        "../../db/prisma.js",
        () => ({
            prisma: {
                user: {
                    findFirst: mockFindFirst,
                    create: mockCreate,
                    findUnique: mockFindUnique,
                    update: mockUpdate,
                },
            },
        })
    );
}