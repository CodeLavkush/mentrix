import { jest } from "@jest/globals";
import type { Mock } from "node:test";
import { otpKey } from "../../utils/generate-otp.js";

export const mockGenerateOTP: Mock<any> = jest.fn<
    () => {
        otp: string;
        otpExpiry: number;
    }
>();


export function setupOtpMock() {
    jest.unstable_mockModule(
        "../../utils/generate-otp.js",
        () => ({
            generateOTP: mockGenerateOTP,
            otpKey,
        })
    );
}