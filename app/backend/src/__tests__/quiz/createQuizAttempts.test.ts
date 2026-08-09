import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockQuizzesFindFirst,
    mockQuizAttemptsCreate,
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
    "POST /api/v1/quiz-attempts/:quizId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should create quiz attempt successfully",
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


                // Quiz attempt created
                mockQuizAttemptsCreate
                    .mockResolvedValue({
                        id: "attempt-id-123",

                        quizId:
                            "quiz-id-123",

                        score: 8,

                        totalMarks: 10,

                        percentage: 80,

                        timeTaken: 300,

                        attemptedAt:
                            new Date(
                                "2026-08-09T10:00:00.000Z"
                            ),
                    });


                // Act
                const response =
                    await request(app)
                        .post(
                            "/api/v1/quiz-attempts/quiz-id-123"
                        )
                        .send({
                            score: 8,
                            totalMarks: 10,
                            percentage: 80,
                            timeTaken: 300,
                        });


                // Assert status
                expect(
                    response.status
                ).toBe(201);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quiz attempt creation successfull."
                );


                // Assert response data
                expect(
                    response.body.data
                ).toEqual({
                    id: "attempt-id-123",

                    quizId:
                        "quiz-id-123",

                    score: 8,

                    totalMarks: 10,

                    percentage: 80,

                    timeTaken: 300,

                    attemptedAt:
                        "2026-08-09T10:00:00.000Z",
                });


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


                // Quiz attempt creation
                expect(
                    mockQuizAttemptsCreate
                ).toHaveBeenCalledWith({
                    data: {
                        quizId:
                            "quiz-id-123",

                        userId:
                            "user-id-123",

                        score: 8,

                        totalMarks: 10,

                        percentage: 80,

                        timeTaken: 300,
                    },

                    select: {
                        id: true,

                        quizId: true,

                        score: true,

                        totalMarks: true,

                        percentage: true,

                        timeTaken: true,

                        attemptedAt: true,
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
                        .post(
                            "/api/v1/quiz-attempts/quiz-id-123"
                        )
                        .send({
                            score: 8,
                            totalMarks: 10,
                            percentage: 80,
                            timeTaken: 300,
                        });


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


                // Attempt should not be created
                expect(
                    mockQuizAttemptsCreate
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
                        .post(
                            "/api/v1/quiz-attempts/quiz-id-123"
                        )
                        .send({
                            score: 8,
                            totalMarks: 10,
                            percentage: 80,
                            timeTaken: 300,
                        });


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


                // Attempt should not be created
                expect(
                    mockQuizAttemptsCreate
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when quiz attempt creation fails",
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


                // Creation fails
                mockQuizAttemptsCreate
                    .mockResolvedValue(null);


                // Act
                const response =
                    await request(app)
                        .post(
                            "/api/v1/quiz-attempts/quiz-id-123"
                        )
                        .send({
                            score: 8,
                            totalMarks: 10,
                            percentage: 80,
                            timeTaken: 300,
                        });


                // Assert status
                expect(
                    response.status
                ).toBe(404);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quiz attempt creation failed."
                );


                // Attempt creation was called
                expect(
                    mockQuizAttemptsCreate
                ).toHaveBeenCalledWith({
                    data: {
                        quizId:
                            "quiz-id-123",

                        userId:
                            "user-id-123",

                        score: 8,

                        totalMarks: 10,

                        percentage: 80,

                        timeTaken: 300,
                    },

                    select: {
                        id: true,

                        quizId: true,

                        score: true,

                        totalMarks: true,

                        percentage: true,

                        timeTaken: true,

                        attemptedAt: true,
                    },
                });
            }
        );
    }
);
