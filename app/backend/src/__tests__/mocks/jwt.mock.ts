import { jest } from "@jest/globals";
import type { Mock } from "node:test";

export const mockVerify: Mock<any> = jest.fn();

export function setupJWTMock() {
    jest.unstable_mockModule(
        "jsonwebtoken",
        () => ({
            default: {
                verify: mockVerify,
            },
        })
    );
}