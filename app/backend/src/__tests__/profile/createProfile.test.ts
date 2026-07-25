import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockAcademicDetailsFindFirst,
    mockAcademicDetailsCreate,
    setupPrismaMock,

    setupAuthMiddlwareMock
} from "../mocks/index.js";


// Setup Prisma mock
setupPrismaMock();
setupAuthMiddlwareMock()

// Import app after registering mocks
const { default: app } =
    await import("../../app.js");


describe(
    "POST /api/v1/profile/academics",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should create academic profile successfully",
            async () => {

                // Arrange
                mockAcademicDetailsFindFirst
                    .mockResolvedValue(null);


                mockAcademicDetailsCreate
                    .mockResolvedValue({
                        id: "profile-id-123",
                        collegeName: "ABC College",
                        universityName: "Mumbai University",
                        course: "BSc IT",
                        branch: "Information Technology",
                        year: 3,
                        semester: 6,
                        rollNumber: "123",
                        userId: "user-id-123",
                    });


                // Act
                const response =
                    await request(app)
                        .post(
                            "/api/v1/profile/academics"
                        )
                        .send({
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
                                "123",
                        });


                // Assert status
                expect(
                    response.status
                ).toBe(201);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Academic details added successfully"
                );


                // Assert response data
                expect(
                    response.body.data
                ).toEqual({
                    id: "profile-id-123",
                    collegeName: "ABC College",
                    universityName: "Mumbai University",
                    course: "BSc IT",
                    branch: "Information Technology",
                    year: 3,
                    semester: 6,
                    rollNumber: "123",
                    userId: "user-id-123",
                });


                // Existing profile check
                expect(
                    mockAcademicDetailsFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        userId: "user-id-123",
                    },
                    select: {
                        id: true,
                    },
                });


                // Profile creation
                expect(
                    mockAcademicDetailsCreate
                ).toHaveBeenCalledWith({
                    data: {
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
                            "123",

                        userId:
                            "user-id-123",
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
                    },
                });
            }
        );


        it(
            "should return 409 when academic details already exist",
            async () => {

                // Existing profile
                mockAcademicDetailsFindFirst
                    .mockResolvedValue({
                        id: "existing-profile-id",
                    });


                const response =
                    await request(app)
                        .post(
                            "/api/v1/profile/academics"
                        )
                        .send({
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
                                "123",
                        });


                expect(
                    response.status
                ).toBe(409);


                expect(
                    response.body.message
                ).toBe(
                    "academic details already exists"
                );


                expect(
                    mockAcademicDetailsCreate
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when profile creation fails",
            async () => {

                // No existing profile
                mockAcademicDetailsFindFirst
                    .mockResolvedValue(null);


                // Prisma create returns null
                mockAcademicDetailsCreate
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/profile/academics"
                        )
                        .send({
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
                                "123",
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Failed to create academic details"
                );
            }
        );
    }
);