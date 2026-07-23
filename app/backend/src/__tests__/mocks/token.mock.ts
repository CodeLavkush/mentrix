import { jest } from "@jest/globals";
import type { Mock } from "node:test";

export const mockGenerateAccessAndRefreshTokens: Mock<any> =
    jest.fn();

export function setupTokensMock() {
    jest.unstable_mockModule(
        "../../utils/generate-tokens.js",
        () => ({
            generateAccessAndRefreshTokens:
                mockGenerateAccessAndRefreshTokens,
        })
    );
}