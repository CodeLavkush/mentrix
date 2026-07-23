import { jest } from "@jest/globals";
import type { Mock } from "node:test";

export const mockHash: Mock<any> = jest.fn<
    (password: string, saltRounds: number) => Promise<string>
>();

export const mockCompare: Mock<any> = jest.fn();

export function setupBcryptMock() {
    jest.unstable_mockModule(
        "bcrypt",
        () => ({
            default: {
                hash: mockHash,
                compare: mockCompare,
            },
        })
    );
}
