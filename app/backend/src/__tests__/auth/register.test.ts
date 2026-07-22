import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockCreate,
    mockFindFirst,
    mockFindUnique,
    setupPrismaMock,

    mockHash,
    setupBcryptMock,

    mockRedisSet,
    setupRedisMock,

    mockGetFileUrl,
    mockUploadFile,
    setupStorageMock,

    mockEmailVerificationMailgenContent,
    mockSendEmail,
    setupMailMock,

    mockGenerateOTP,
    setupOtpMock
} from "../mocks/index.js"



setupPrismaMock()

setupBcryptMock()

setupRedisMock()

setupStorageMock()

setupMailMock()

setupOtpMock()


const { default: app } = await import("../../app.js");


describe(
    "POST /api/v1/auth/register",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        // ==================================================
        // SUCCESSFUL REGISTRATION WITH AVATAR
        // ==================================================

        it(
            "should register a user successfully",
            async () => {

                // ------------------------------------------
                // Mock duplicate-user check
                // ------------------------------------------

                mockFindFirst.mockResolvedValue(null);


                // ------------------------------------------
                // Mock bcrypt
                // ------------------------------------------

                mockHash.mockResolvedValue(
                    "hashed-password"
                );


                // ------------------------------------------
                // Mock file upload
                // ------------------------------------------

                mockUploadFile.mockResolvedValue(
                    undefined
                );


                // ------------------------------------------
                // Mock avatar URL
                // ------------------------------------------

                mockGetFileUrl.mockResolvedValue(
                    "http://localhost:9000/avatars/avatar.png"
                );


                // ------------------------------------------
                // Mock OTP
                // ------------------------------------------

                mockGenerateOTP.mockReturnValue({
                    otp: "123456",
                    otpExpiry: 300,
                });


                // ------------------------------------------
                // Mock user creation
                // ------------------------------------------

                mockCreate.mockResolvedValue({
                    id: "user-id-123",
                    username: "john",
                    gender: "MALE",
                    age: 20,
                    email: "john@example.com",
                    isEmailVerified: false,
                    avatarKey:
                        "users/avatars/avatar.png",
                });


                // ------------------------------------------
                // Mock final user query
                // ------------------------------------------

                mockFindUnique.mockResolvedValue({
                    id: "user-id-123",
                    username: "john",
                    gender: "MALE",
                    age: 20,
                    email: "john@example.com",
                    isEmailVerified: false,
                });


                // ------------------------------------------
                // Send request
                // ------------------------------------------

                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/register"
                        )
                        .field(
                            "username",
                            "john"
                        )
                        .field(
                            "gender",
                            "MALE"
                        )
                        .field(
                            "age",
                            "20"
                        )
                        .field(
                            "email",
                            "john@example.com"
                        )
                        .field(
                            "password",
                            "Password@123"
                        )
                        .attach(
                            "avatar",
                            Buffer.from(
                                "fake image"
                            ),
                            {
                                filename:
                                    "avatar.png",

                                contentType:
                                    "image/png",
                            }
                        );


                expect(
                    response.status
                ).toBe(201);


                expect(
                    response.body.message
                ).toBe(
                    "User registered successfully. Please check your email for the OTP to verify your account."
                );


                expect(
                    response.body.data
                ).toEqual({
                    id: "user-id-123",
                    username: "john",
                    gender: "MALE",
                    age: 20,
                    email: "john@example.com",
                    isEmailVerified: false,
                    avatarUrl:
                        "http://localhost:9000/avatars/avatar.png",
                });


                expect(
                    mockFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        OR: [
                            {
                                email:
                                    "john@example.com",
                            },
                            {
                                username:
                                    "john",
                            },
                        ],
                    },

                    select: {
                        id: true,
                    },
                });


                expect(
                    mockHash
                ).toHaveBeenCalledWith(
                    "Password@123",
                    10
                );


                expect(
                    mockUploadFile
                ).toHaveBeenCalledWith(
                    expect.stringContaining(
                        "users/avatars/"
                    ),

                    expect.any(Buffer),

                    "image/png"
                );


                expect(
                    mockCreate
                ).toHaveBeenCalled();


                expect(
                    mockRedisSet
                ).toHaveBeenCalled();


                expect(
                    mockSendEmail
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        email:
                            "john@example.com",

                        subject:
                            "Please verify your email",
                    })
                );
            }
        );


        // ==================================================
        // DUPLICATE USER
        // ==================================================

        it(
            "should return 409 if user already exists",
            async () => {

                mockFindFirst.mockResolvedValue({
                    id: "existing-user-id",
                });


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/register"
                        )
                        .field(
                            "username",
                            "john"
                        )
                        .field(
                            "gender",
                            "MALE"
                        )
                        .field(
                            "age",
                            "20"
                        )
                        .field(
                            "email",
                            "john@example.com"
                        )
                        .field(
                            "password",
                            "Password@123"
                        );


                expect(
                    response.status
                ).toBe(409);


                expect(
                    response.body.message
                ).toBe(
                    "User already exists"
                );


                expect(
                    mockCreate
                ).not.toHaveBeenCalled();


                expect(
                    mockHash
                ).not.toHaveBeenCalled();


                expect(
                    mockUploadFile
                ).not.toHaveBeenCalled();


                expect(
                    mockGetFileUrl
                ).not.toHaveBeenCalled();


                expect(
                    mockSendEmail
                ).not.toHaveBeenCalled();


                expect(
                    mockRedisSet
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // REGISTRATION WITHOUT AVATAR
        // ==================================================

        it(
            "should register a user without an avatar",
            async () => {

                mockFindFirst.mockResolvedValue(null);


                mockHash.mockResolvedValue(
                    "hashed-password"
                );


                mockGenerateOTP.mockReturnValue({
                    otp: "123456",
                    otpExpiry: 300,
                });


                mockCreate.mockResolvedValue({
                    id: "user-id-123",
                    username: "john",
                    gender: "MALE",
                    age: 20,
                    email: "john@example.com",
                    isEmailVerified: false,
                    avatarKey: null,
                });


                mockFindUnique.mockResolvedValue({
                    id: "user-id-123",
                    username: "john",
                    gender: "MALE",
                    age: 20,
                    email: "john@example.com",
                    isEmailVerified: false,
                });


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/register"
                        )
                        .field(
                            "username",
                            "john"
                        )
                        .field(
                            "gender",
                            "MALE"
                        )
                        .field(
                            "age",
                            "20"
                        )
                        .field(
                            "email",
                            "john@example.com"
                        )
                        .field(
                            "password",
                            "Password@123"
                        );


                expect(
                    response.status
                ).toBe(201);


                expect(
                    response.body.data.avatarUrl
                ).toBeNull();


                expect(
                    mockUploadFile
                ).not.toHaveBeenCalled();


                expect(
                    mockGetFileUrl
                ).not.toHaveBeenCalled();


                expect(
                    mockSendEmail
                ).toHaveBeenCalled();


                expect(
                    mockRedisSet
                ).toHaveBeenCalled();
            }
        );
    }
);