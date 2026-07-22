import { jest } from "@jest/globals";
import type { Mock } from "node:test";

export const mockRedisSet: Mock<any> = jest.fn<
    (...args: unknown[]) => Promise<unknown>
>();

export function setupRedisMock() {
    jest.unstable_mockModule(
        "../../db/redis.js",
        () => ({
            redisClient: {
                set: mockRedisSet,
            },
        })
    );
}