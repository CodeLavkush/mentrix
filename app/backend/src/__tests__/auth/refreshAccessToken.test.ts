import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockUpdate,
    setupPrismaMock,

    mockVerify,
    setupJWTMock,

    mockGenerateAccessAndRefreshTokens,
    setupTokensMock,
} from "../mocks/index.js"

setupPrismaMock();
setupJWTMock();
setupTokensMock();


const { default: app } =
    await import("../../app.js");


describe(
    "POST /api/v1/auth/refresh-token",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should refresh access token successfully",
            async () => {

                const oldRefreshToken =
                    "old-refresh-token";


                const newAccessToken =
                    "new-access-token";


                const newRefreshToken =
                    "new-refresh-token";


                // JWT verification succeeds
                mockVerify.mockReturnValue({
                    id: "user-id-123",
                });


                // User exists and has the same refresh token
                mockFindFirst.mockResolvedValue({
                    id: "user-id-123",
                    username: "john",
                    email: "john@example.com",
                    gender: "MALE",
                    age: 20,
                    isEmailVerified: true,
                    refreshToken: oldRefreshToken,
                });


                // Generate new tokens
                mockGenerateAccessAndRefreshTokens.mockResolvedValue({
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                });


                // Update refresh token
                mockUpdate.mockResolvedValue({
                    id: "user-id-123",
                });


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/refresh-token"
                        )
                        .send({
                            refreshToken:
                                oldRefreshToken,
                        });


                expect(
                    response.status
                ).toBe(200);


                expect(
                    response.body.message
                ).toBe(
                    "Access Token refreshed"
                );


                expect(
                    response.body.data
                ).toEqual({
                    accessToken:
                        newAccessToken,

                    refreshToken:
                        newRefreshToken,
                });


                expect(
                    mockVerify
                ).toHaveBeenCalledWith(
                    oldRefreshToken,
                    process.env
                        .REFRESH_TOKEN_SECRET
                );


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
                        gender: true,
                        age: true,
                        isEmailVerified: true,
                        refreshToken: true,
                    },
                });


                expect(
                    mockGenerateAccessAndRefreshTokens
                ).toHaveBeenCalled();


                expect(
                    mockUpdate
                ).toHaveBeenCalledWith({
                    where: {
                        id: "user-id-123",
                    },
                    data: {
                        refreshToken:
                            newRefreshToken,
                    },
                });


                expect(
                    response.headers["set-cookie"]
                ).toBeDefined();
            }
        );

        it(
            "should return 401 when refresh token is missing",
            async () => {

                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/refresh-token"
                        )
                        .send({});


                expect(
                    response.status
                ).toBe(401);


                expect(
                    response.body.message
                ).toBe(
                    "Unauthorized Access"
                );


                expect(
                    mockVerify
                ).not.toHaveBeenCalled();


                expect(
                    mockFindFirst
                ).not.toHaveBeenCalled();


                expect(
                    mockGenerateAccessAndRefreshTokens
                ).not.toHaveBeenCalled();


                expect(
                    mockUpdate
                ).not.toHaveBeenCalled();
            }
        );

        it(
            "should return 401 when refresh token is invalid",
            async () => {

                mockVerify.mockImplementation(
                    () => {
                        throw new Error(
                            "Invalid token"
                        );
                    }
                );


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/refresh-token"
                        )
                        .send({
                            refreshToken:
                                "invalid-token",
                        });


                expect(
                    response.status
                ).toBe(401);


                expect(
                    response.body.message
                ).toBe(
                    "Invalid refresh Token"
                );


                expect(
                    mockFindFirst
                ).not.toHaveBeenCalled();


                expect(
                    mockGenerateAccessAndRefreshTokens
                ).not.toHaveBeenCalled();
            }
        );
        it(
            "should return 401 when user does not exist",
            async () => {

                mockVerify.mockReturnValue({
                    id: "user-id-123",
                });


                mockFindFirst.mockResolvedValue(
                    null
                );


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/refresh-token"
                        )
                        .send({
                            refreshToken:
                                "old-refresh-token",
                        });


                expect(
                    response.status
                ).toBe(401);


                expect(
                    response.body.message
                ).toBe(
                    "Invalid refresh Token"
                );


                expect(
                    mockGenerateAccessAndRefreshTokens
                ).not.toHaveBeenCalled();


                expect(
                    mockUpdate
                ).not.toHaveBeenCalled();
            }
        );

        it(
            "should return 401 when refresh token does not match",
            async () => {

                mockVerify.mockReturnValue({
                    id: "user-id-123",
                });


                mockFindFirst.mockResolvedValue({
                    id: "user-id-123",
                    username: "john",
                    email: "john@example.com",
                    gender: "MALE",
                    age: 20,
                    isEmailVerified: true,
                    refreshToken:
                        "different-refresh-token",
                });


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/refresh-token"
                        )
                        .send({
                            refreshToken:
                                "old-refresh-token",
                        });


                expect(
                    response.status
                ).toBe(401);


                expect(
                    response.body.message
                ).toBe(
                    "Invalid refresh Token"
                );


                expect(
                    mockGenerateAccessAndRefreshTokens
                ).not.toHaveBeenCalled();


                expect(
                    mockUpdate
                ).not.toHaveBeenCalled();
            }
        );
    }
);