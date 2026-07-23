import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindUnique,
    mockFindFirst,
    setupPrismaMock,

    mockCompare,
    setupBcryptMock,

    mockGenerateAccessAndRefreshTokens,
    setupTokensMock,
} from "../mocks/index.js"


setupPrismaMock();
setupBcryptMock();
setupTokensMock();


const { default: app } =
    await import("../../app.js");


describe(
    "POST /api/v1/auth/login",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should return 400 when email and password are missing",
            async () => {

                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/login"
                        )
                        .send({});


                expect(
                    response.status
                ).toBe(422);


                expect(
                    response.body.message
                ).toBe(
                    "Received data is not valid"
                );


                expect(
                    mockFindUnique
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 401 when user does not exist",
            async () => {

                mockFindUnique
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/login"
                        )
                        .send({
                            email:
                                "john@example.com",

                            password:
                                "Password@123",
                        });


                expect(
                    response.status
                ).toBe(401);


                expect(
                    response.body.message
                ).toBe(
                    "User does not exist"
                );


                expect(
                    mockCompare
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 401 for invalid password",
            async () => {

                mockFindUnique
                    .mockResolvedValue({
                        id: "user-id-123",
                        password:
                            "hashed-password",
                        isEmailVerified: true,
                        username: "john",
                        gender: "MALE",
                        age: 20,
                        email:
                            "john@example.com",
                        refreshToken: null,
                    });


                mockCompare
                    .mockResolvedValue(false);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/login"
                        )
                        .send({
                            email:
                                "john@example.com",

                            password:
                                "WrongPassword",
                        });


                expect(
                    response.status
                ).toBe(401);


                expect(
                    response.body.message
                ).toBe(
                    "Invalid password"
                );


                expect(
                    mockCompare
                ).toHaveBeenCalledWith(
                    "WrongPassword",
                    "hashed-password"
                );


                expect(
                    mockGenerateAccessAndRefreshTokens
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should login user successfully",
            async () => {

                mockFindUnique
                    .mockResolvedValue({
                        id: "user-id-123",
                        password:
                            "hashed-password",
                        isEmailVerified: true,
                        username: "john",
                        gender: "MALE",
                        age: 20,
                        email:
                            "john@example.com",
                        refreshToken: null,
                    });


                mockCompare
                    .mockResolvedValue(true);


                mockGenerateAccessAndRefreshTokens
                    .mockResolvedValue({
                        accessToken:
                            "access-token-123",

                        refreshToken:
                            "refresh-token-123",
                    });


                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                        username: "john",
                        email:
                            "john@example.com",
                        gender: "MALE",
                        age: 20,
                        isEmailVerified: true,
                    });


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/login"
                        )
                        .send({
                            email:
                                "john@example.com",

                            password:
                                "Password@123",
                        });


                expect(
                    response.status
                ).toBe(200);


                expect(
                    response.body.message
                ).toBe(
                    "User logged in successfully"
                );


                expect(
                    response.body.data
                ).toEqual({
                    user: {
                        id: "user-id-123",
                        username: "john",
                        email:
                            "john@example.com",
                        gender: "MALE",
                        age: 20,
                        isEmailVerified: true,
                    },

                    accessToken:
                        "access-token-123",

                    refreshToken:
                        "refresh-token-123",
                });


                expect(
                    response.headers["set-cookie"]
                ).toBeDefined();


                expect(
                    mockCompare
                ).toHaveBeenCalledWith(
                    "Password@123",
                    "hashed-password"
                );


                expect(
                    mockGenerateAccessAndRefreshTokens
                ).toHaveBeenCalled();
            }
        );
    }
);