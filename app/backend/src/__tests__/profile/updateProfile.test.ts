import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockAcademicDetailsUpdate,
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
    "PATCH /api/v1/profile/academics",
    () => {


        beforeEach(() => {
            jest.clearAllMocks();
        });


        // ==================================================
        // SUCCESS
        // ==================================================

        it(
            "should update academic profile successfully",
            async () => {


                // ------------------------------------------
                // User exists
                // ------------------------------------------

                mockFindFirst
                    .mockResolvedValue({

                        id:
                            "user-id-123",
                    });


                // ------------------------------------------
                // Profile updated
                // ------------------------------------------

                mockAcademicDetailsUpdate
                    .mockResolvedValue({

                        id:
                            "profile-id-123",
                    });


                // ------------------------------------------
                // Request
                // ------------------------------------------

                const response =
                    await request(app)
                        .patch(
                            "/api/v1/profile/academics"
                        )
                        .send({

                            collegeName:
                                "Updated ABC College",

                            semester:
                                6,
                        });


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
                    "Academic details successfully updated."
                );


                // ------------------------------------------
                // Response data
                // ------------------------------------------

                expect(
                    response.body.data
                ).toEqual({

                    id:
                        "profile-id-123",
                });


                // ------------------------------------------
                // User query
                // ------------------------------------------

                expect(
                    mockFindFirst
                ).toHaveBeenCalledWith({

                    where: {

                        id:
                            "user-id-123",
                    },

                    select: {

                        id:
                            true,
                    },
                });


                // ------------------------------------------
                // Profile update query
                // ------------------------------------------

                expect(
                    mockAcademicDetailsUpdate
                ).toHaveBeenCalledWith({

                    where: {

                        userId:
                            "user-id-123",
                    },

                    data: {

                        collegeName:
                            "Updated ABC College",

                        semester:
                            6,
                    },

                    select: {

                        id:
                            true,
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
                        .patch(
                            "/api/v1/profile/academics"
                        )
                        .send({

                            collegeName:
                                "Updated ABC College",
                        });


                // Status
                expect(
                    response.status
                ).toBe(404);


                // Message
                expect(
                    response.body.message
                ).toBe(
                    "User does not exists."
                );


                // Profile update must not execute
                expect(
                    mockAcademicDetailsUpdate
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // UPDATE FAILED
        // ==================================================

        it(
            "should return 404 when profile update fails",
            async () => {


                // User exists
                mockFindFirst
                    .mockResolvedValue({

                        id:
                            "user-id-123",
                    });


                // Update returns null
                mockAcademicDetailsUpdate
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .patch(
                            "/api/v1/profile/academics"
                        )
                        .send({

                            collegeName:
                                "Updated ABC College",
                        });


                // Status
                expect(
                    response.status
                ).toBe(404);


                // Message
                expect(
                    response.body.message
                ).toBe(
                    "Failed to update academic details"
                );
            }
        );
        it(
            "should update only the provided fields",
            async () => {

                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });

                mockAcademicDetailsUpdate
                    .mockResolvedValue({
                        id: "profile-id-123",
                    });

                await request(app)
                    .patch(
                        "/api/v1/profile/academics"
                    )
                    .send({
                        semester: 6,
                    });

                expect(
                    mockAcademicDetailsUpdate
                ).toHaveBeenCalledWith({

                    where: {
                        userId: "user-id-123",
                    },

                    data: {
                        semester: 6,
                    },

                    select: {
                        id: true,
                    },
                });
            }
        );
    }
);