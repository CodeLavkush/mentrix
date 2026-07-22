import { jest } from "@jest/globals";
import type { Mock } from "node:test";

export const mockHash: Mock<any> = jest.fn<
    (password: string, saltRounds: number) => Promise<string>
>();

export function setupBcryptMock() {
    jest.unstable_mockModule(
        "bcrypt",
        () => ({
            default: {
                hash: mockHash,
            },
        })
    );
}
