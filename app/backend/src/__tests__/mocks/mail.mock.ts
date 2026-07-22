import { jest } from "@jest/globals";
import type { Mock } from "node:test";


export const mockSendEmail: Mock<any> = jest.fn<
    (options: unknown) => Promise<void>
>();

export const mockEmailVerificationMailgenContent: Mock<any> = jest.fn<
    (options: unknown) => Promise<void>
>();

export function setupMailMock() {
    jest.unstable_mockModule(
        "../../utils/mail.js",
        () => ({
            sendEmail: mockSendEmail,
            emailVerificationMailgenContent: mockEmailVerificationMailgenContent,
        })
    );
}