import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockQuizzesFindFirst,
    mockQuizAttemptsFindMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

// Setup Prisma mock
setupPrismaMock();
setupAuthMiddlwareMock();

// Import app after registering mocks
const { default: app } =
    await import("../../app.js");


describe(
    "GET /api/v1/quiz-attempts/:quizId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should fetch all quiz attempts successfully",
            async () => {

                // Arrange

                // User exists
                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });


                // Quiz exists
                mockQuizzesFindFirst
                    .mockResolvedValue({
                        id: "quiz-id-123",
                    });


                // Quiz attempts exist
                mockQuizAttemptsFindMany
                    .mockResolvedValue([
                        {
                            id: "attempt-id-1",

                            quizId:
                                "quiz-id-123",

                            userId:
                                "user-id-123",

                            score: 8,

                            totalMarks: 10,

                            percentage: 80,

                            timeTaken: 300,

                            attemptedAt:
                                new Date(
                                    "2026-08-09T10:00:00.000Z"
                                ),
                        },

                        {
                            id: "attempt-id-2",

                            quizId:
                                "quiz-id-123",

                            userId:
                                "user-id-123",

                            score: 9,

                            totalMarks: 10,

                            percentage: 90,

                            timeTaken: 250,

                            attemptedAt:
                                new Date(
                                    "2026-08-09T11:00:00.000Z"
                                ),
                        },
                    ]);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz-attempts/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(200);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quiz attempts fetched successfully."
                );


                // Assert response data
                expect(
                    response.body.data
                ).toEqual([
                    {
                        id: "attempt-id-1",

                        quizId:
                            "quiz-id-123",

                        userId:
                            "user-id-123",

                        score: 8,

                        totalMarks: 10,

                        percentage: 80,

                        timeTaken: 300,

                        attemptedAt:
                            "2026-08-09T10:00:00.000Z",
                    },

                    {
                        id: "attempt-id-2",

                        quizId:
                            "quiz-id-123",

                        userId:
                            "user-id-123",

                        score: 9,

                        totalMarks: 10,

                        percentage: 90,

                        timeTaken: 250,

                        attemptedAt:
                            "2026-08-09T11:00:00.000Z",
                    },
                ]);


                // User lookup
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


                // Quiz lookup
                expect(
                    mockQuizzesFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        id: "quiz-id-123",
                    },

                    select: {
                        id: true,
                    },
                });


                // Quiz attempts lookup
                expect(
                    mockQuizAttemptsFindMany
                ).toHaveBeenCalledWith({
                    where: {
                        quizId:
                            "quiz-id-123",

                        userId:
                            "user-id-123",
                    },
                });
            }
        );


        it(
            "should return 404 when user does not exist",
            async () => {

                // User does not exist
                mockFindFirst
                    .mockResolvedValue(null);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz-attempts/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(404);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "User does not exists."
                );


                // Quiz should not be queried
                expect(
                    mockQuizzesFindFirst
                ).not.toHaveBeenCalled();


                // Attempts should not be fetched
                expect(
                    mockQuizAttemptsFindMany
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when quiz does not exist",
            async () => {

                // User exists
                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });


                // Quiz does not exist
                mockQuizzesFindFirst
                    .mockResolvedValue(null);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz-attempts/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(404);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quiz does not exists."
                );


                // Attempts should not be fetched
                expect(
                    mockQuizAttemptsFindMany
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when no quiz attempts exist",
            async () => {

                // User exists
                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });


                // Quiz exists
                mockQuizzesFindFirst
                    .mockResolvedValue({
                        id: "quiz-id-123",
                    });


                // No attempts
                mockQuizAttemptsFindMany
                    .mockResolvedValue([]);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz-attempts/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(404);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Failed to fetched quiz attempts."
                );


                // Attempts lookup
                expect(
                    mockQuizAttemptsFindMany
                ).toHaveBeenCalledWith({
                    where: {
                        quizId:
                            "quiz-id-123",

                        userId:
                            "user-id-123",
                    },
                });
            }
        );
    }
);
