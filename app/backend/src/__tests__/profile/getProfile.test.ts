import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockAcademicDetailsFindFirst,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";


// ======================================================
// SETUP MOCKS
// ======================================================

setupPrismaMock();

setupAuthMiddlwareMock();


// ======================================================
// IMPORT APP AFTER MOCKS
// ======================================================

const { default: app } =
    await import("../../app.js");


// ======================================================
// TEST SUITE
// ======================================================

describe(
    "GET /api/v1/profile/academics",
    () => {


        beforeEach(() => {
            jest.clearAllMocks();
        });


        // ==================================================
        // SUCCESS
        // ==================================================

        it(
            "should fetch academic profile successfully",
            async () => {


                // ------------------------------------------
                // User exists
                // ------------------------------------------

                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });


                // ------------------------------------------
                // Academic profile exists
                // ------------------------------------------

                mockAcademicDetailsFindFirst
                    .mockResolvedValue({
                        id: "profile-id-123",

                        collegeName:
                            "ABC College",

                        universityName:
                            "Mumbai University",

                        course:
                            "BSc IT",

                        branch:
                            "Information Technology",

                        year: 3,

                        semester: 6,

                        rollNumber:
                            "IT123",

                        userId:
                            "user-id-123",

                        user: {
                            id:
                                "user-id-123",

                            username:
                                "john",
                        },
                    });


                // ------------------------------------------
                // Request
                // ------------------------------------------

                const response =
                    await request(app)
                        .get(
                            "/api/v1/profile/academics"
                        );


                // ------------------------------------------
                // Status
                // ------------------------------------------

                expect(
                    response.status
                ).toBe(200);


                // ------------------------------------------
                // Message
                // ------------------------------------------

                expect(
                    response.body.message
                ).toBe(
                    "Profile fetched successfully"
                );


                // ------------------------------------------
                // Response data
                // ------------------------------------------

                expect(
                    response.body.data
                ).toEqual({

                    id:
                        "profile-id-123",

                    collegeName:
                        "ABC College",

                    universityName:
                        "Mumbai University",

                    course:
                        "BSc IT",

                    branch:
                        "Information Technology",

                    year:
                        3,

                    semester:
                        6,

                    rollNumber:
                        "IT123",

                    userId:
                        "user-id-123",

                    user: {

                        id:
                            "user-id-123",

                        username:
                            "john",
                    },
                });


                // ------------------------------------------
                // User query
                // ------------------------------------------

                expect(
                    mockFindFirst
                ).toHaveBeenCalledWith({

                    where: {
                        id: "user-id-123",
                    },

                    select: {
                        id: true,
                    },
                });


                // ------------------------------------------
                // Academic profile query
                // ------------------------------------------

                expect(
                    mockAcademicDetailsFindFirst
                ).toHaveBeenCalledWith({

                    where: {
                        userId: "user-id-123",
                    },

                    select: {

                        id: true,

                        collegeName: true,

                        universityName: true,

                        course: true,

                        branch: true,

                        year: true,

                        semester: true,

                        rollNumber: true,

                        userId: true,

                        user: {

                            select: {

                                id: true,

                                username: true,
                            },
                        },
                    },
                });
            }
        );


        // ==================================================
        // USER NOT FOUND
        // ==================================================

        it(
            "should return 404 when user does not exist",
            async () => {


                // User does not exist
                mockFindFirst
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .get(
                            "/api/v1/profile/academics"
                        );


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "User does not exists"
                );


                // Academic query should never execute
                expect(
                    mockAcademicDetailsFindFirst
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // PROFILE NOT FOUND
        // ==================================================

        it(
            "should return 404 when academic profile does not exist",
            async () => {


                // User exists
                mockFindFirst
                    .mockResolvedValue({

                        id:
                            "user-id-123",
                    });


                // Academic profile does not exist
                mockAcademicDetailsFindFirst
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .get(
                            "/api/v1/profile/academics"
                        );


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Academic details not found."
                );


                // Both queries should execute
                expect(
                    mockFindFirst
                ).toHaveBeenCalled();


                expect(
                    mockAcademicDetailsFindFirst
                ).toHaveBeenCalled();
            }
        );
    }
);