import request from "supertest";
import { jest } from "@jest/globals";
import { emailVerificationMailgenContent } from "../utils/mail.js";
import { otpKey } from "../utils/generate-otp.js";


// ======================================================
// TYPES
// ======================================================

type MockCreatedUser = {
    id: string;
    username: string;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    age: number | null;
    email: string;
    isEmailVerified: boolean;
    avatarKey: string | null;
};


type MockCreatedUserWithoutAvatar = {
    id: string;
    username: string;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    age: number | null;
    email: string;
    isEmailVerified: boolean;
};


// ======================================================
// CREATE MOCK FUNCTIONS FIRST
// ======================================================

const mockFindFirst = jest.fn<
    (args: unknown) => Promise<{ id: string } | null>
>();


const mockCreate = jest.fn<
    (args: unknown) => Promise<MockCreatedUser>
>();


const mockFindUnique = jest.fn<
    (args: unknown) => Promise<
        MockCreatedUserWithoutAvatar | null
    >
>();


const mockHash = jest.fn<
    (password: string, saltRounds: number) => Promise<string>
>();


const mockRedisSet = jest.fn<
    (...args: unknown[]) => Promise<unknown>
>();


const mockUploadFile = jest.fn<
    (
        key: string,
        buffer: Buffer,
        mimetype: string
    ) => Promise<void>
>();


const mockGetFileUrl = jest.fn<
    (key: string) => Promise<string>
>();


const mockSendEmail = jest.fn<
    (options: unknown) => Promise<void>
>();


const mockGenerateOTP = jest.fn<
    () => {
        otp: string;
        otpExpiry: number;
    }
>();


// ======================================================
// MOCK MODULES
// ======================================================

jest.unstable_mockModule(
    "../db/prisma.js",
    () => ({
        prisma: {
            user: {
                findFirst: mockFindFirst,
                create: mockCreate,
                findUnique: mockFindUnique,
            },
        },
    })
);


jest.unstable_mockModule(
    "bcrypt",
    () => ({
        default: {
            hash: mockHash,
        },
    })
);


jest.unstable_mockModule(
    "../db/redis.js",
    () => ({
        redisClient: {
            set: mockRedisSet,
        },
    })
);


jest.unstable_mockModule(
    "../services/storage.service.js",
    () => ({
        uploadFile: mockUploadFile,
        getFileUrl: mockGetFileUrl,
    })
);


jest.unstable_mockModule(
    "../utils/mail.js",
    () => ({
        sendEmail: mockSendEmail,
        emailVerificationMailgenContent,
    })
);


jest.unstable_mockModule(
    "../utils/generate-otp.js",
    () => ({
        generateOTP: mockGenerateOTP,
        otpKey,
    })
);


// ======================================================
// IMPORT AFTER MOCKS
// ======================================================

const { default: app } = await import("../app.js");


// ======================================================
// TEST SUITE
// ======================================================

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