import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockUpdate,
    setupPrismaMock,

    setupAuthMiddlwareMock
} from "../mocks/index.js";


// Register Prisma mock before importing app
setupPrismaMock();


// Mock authentication middleware
setupAuthMiddlwareMock()


// Import app after mocks
const { default: app } =
    await import("../../app.js");


describe(
    "POST /api/v1/auth/logout",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should logout user successfully",
            async () => {

                // Arrange
                mockUpdate.mockResolvedValue({
                    id: "user-id-123",
                });


                // Act
                const response =
                    await request(app)
                        .post(
                            "/api/v1/auth/logout"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(200);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "User logged out successfully"
                );


                // Assert database update
                expect(
                    mockUpdate
                ).toHaveBeenCalledWith({
                    where: {
                        id: "user-id-123",
                    },

                    data: {
                        refreshToken: null,
                    },
                });


                // Assert cookies are cleared
                expect(
                    response.headers["set-cookie"]
                ).toBeDefined();
            }
        );
    }
);