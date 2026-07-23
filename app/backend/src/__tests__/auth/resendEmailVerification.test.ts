import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    setupPrismaMock,

    mockRedisSet,
    setupRedisMock,

    mockGenerateOTP,
    setupOtpMock,

    mockSendEmail,
    setupMailMock,
} from "../mocks/index.js"

// Register mocks before importing app
setupPrismaMock();
setupRedisMock();
setupOtpMock();
setupMailMock();


// Mock verifyJWT
jest.unstable_mockModule(
    "../../middlewares/auth.middleware.js",
    () => ({
        verifyJWT: (
            req: any,
            _res: any,
            next: any
        ) => {
            req.user = {
                id: "user-id-123",
            };

            next();
        },
    })
);


// Import app after all mocks
const { default: app } =
    await import("../../app.js");


describe(
    "POST /api/v1/auth/resend-email-verification",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should resend email verification successfully",
            async () => {

                // Arrange

                mockFindFirst.mockResolvedValue({
                    id: "user-id-123",
                    username: "john",
                    email: "john@example.com",
                    isEmailVerified: false,
                });


                mockGenerateOTP.mockReturnValue({
                    otp: "123456",
                    otpExpiry: 300,
                });


                mockRedisSet.mockResolvedValue(
                    "OK"
                );


                mockSendEmail.mockResolvedValue(
                    undefined
                );


                // Act

                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/resend-email-verification"
                        );


                // Assert status

                expect(
                    response.status
                ).toBe(200);


                // Assert message

                expect(
                    response.body.message
                ).toBe(
                    "Mail has been sent to john@example.com"
                );


                // Assert user query

                expect(
                    mockFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        id: "user-id-123",
                    },
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        isEmailVerified: true,
                    },
                });


                // Assert OTP generation

                expect(
                    mockGenerateOTP
                ).toHaveBeenCalled();


                // Assert OTP storage

                expect(
                    mockRedisSet
                ).toHaveBeenCalledWith(
                    expect.any(String),
                    "123456",
                    "EX",
                    300
                );


                // Assert email

                expect(
                    mockSendEmail
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        email: "john@example.com",
                        subject:
                            "Please verify your email",
                    })
                );
            }
        );
    }
);