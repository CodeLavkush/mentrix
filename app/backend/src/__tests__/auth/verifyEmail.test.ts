import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockUpdate,
    setupPrismaMock,

    mockGet,
    mockDel,
    setupRedisMock,
} from "../mocks/index.js"


setupPrismaMock();
setupRedisMock();


const { default: app } =
    await import("../../app.js");


describe(
    "POST /api/v1/auth/verify-email",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should verify email successfully",
            async () => {

                // 1. User exists
                mockFindFirst.mockResolvedValue({
                    id: "user-id-123",
                });


                // 2. Redis contains correct OTP
                mockGet.mockResolvedValue(
                    "123456"
                );


                // 3. User is updated
                mockUpdate.mockResolvedValue({
                    id: "user-id-123",
                    username: "john",
                    isEmailVerified: true,
                });


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/verify-email"
                        )
                        .send({
                            email: "john@example.com",
                            otp: "123456",
                        });


                expect(
                    response.status
                ).toBe(200);


                expect(
                    response.body.message
                ).toBe(
                    "Email is Verified"
                );


                expect(
                    response.body.data
                ).toEqual({
                    id: "user-id-123",
                    username: "john",
                    isEmailVerified: true,
                });


                expect(
                    mockFindFirst
                ).toHaveBeenCalled();


                expect(
                    mockGet
                ).toHaveBeenCalled();


                expect(
                    mockUpdate
                ).toHaveBeenCalledWith({
                    where: {
                        id: "user-id-123",
                    },
                    data: {
                        isEmailVerified: true,
                    },
                    select: {
                        id: true,
                        username: true,
                        isEmailVerified: true,
                    },
                });


                expect(
                    mockDel
                ).toHaveBeenCalled();
            }
        );

        it(
            "should return 404 when user does not exist",
            async () => {

                mockFindFirst.mockResolvedValue(null);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/verify-email"
                        )
                        .send({
                            email: "unknown@example.com",
                            otp: "123456",
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "User does not exists"
                );


                expect(
                    mockGet
                ).not.toHaveBeenCalled();


                expect(
                    mockUpdate
                ).not.toHaveBeenCalled();


                expect(
                    mockDel
                ).not.toHaveBeenCalled();
            }
        );
    }
);