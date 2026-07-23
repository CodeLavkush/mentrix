import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockGetFileUrl,
    setupStorageMock,

    mockFindFirst,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js"

// Register mocks before importing app
setupPrismaMock();
setupStorageMock();


// Mock authentication middleware
setupAuthMiddlwareMock()


// Import app after mocks
const { default: app } =
    await import("../../app.js");


describe(
    "GET /api/v1/auth/current-user",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should return current user successfully",
            async () => {

                // Arrange
                mockFindFirst.mockResolvedValue({
                    id: "user-id-123",
                    username: "john",
                    gender: "MALE",
                    age: 20,
                    email: "john@example.com",
                    avatarKey:
                        "users/avatars/avatar.png",
                    isEmailVerified: true,
                });


                mockGetFileUrl.mockResolvedValue(
                    "https://storage.example.com/avatar.png"
                );


                // Act
                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/current-user"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(200);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Current user fetched successfully"
                );


                // Assert data
                expect(
                    response.body.data
                ).toEqual({
                    id: "user-id-123",
                    username: "john",
                    gender: "MALE",
                    age: 20,
                    email: "john@example.com",
                    isEmailVerified: true,
                    avatarKey: "users/avatars/avatar.png",
                    avatarUrl:
                        "https://storage.example.com/avatar.png",
                });


                // Assert database query
                expect(
                    mockFindFirst
                ).toHaveBeenCalledWith(
                    expect.objectContaining({
                        where: {
                            id: "user-id-123",
                        },
                    })
                );


                // Assert avatar URL generation
                expect(
                    mockGetFileUrl
                ).toHaveBeenCalledWith(
                    "users/avatars/avatar.png"
                );
            }
        );
    }
);