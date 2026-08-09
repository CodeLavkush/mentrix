import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockQuizzesFindFirst,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

// Setup mocks
setupPrismaMock();
setupAuthMiddlwareMock();

// Import app after registering mocks
const { default: app } =
    await import("../../app.js");


describe(
    "GET /api/v1/quiz/:documentId/:quizId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should fetch quiz successfully",
            async () => {

                // Arrange

                // User exists
                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                        username: "testuser",
                    });


                // Document exists
                mockDocumentsFindFirst
                    .mockResolvedValue({
                        id: "document-id-123",
                    });


                // Quiz exists
                mockQuizzesFindFirst
                    .mockResolvedValue({
                        id: "quiz-id-123",

                        user: {
                            id: "user-id-123",
                            username: "testuser",
                        },

                        document: {
                            id: "document-id-123",
                            fileName: "javascript.pdf",
                        },

                        quizTitle:
                            "JavaScript Quiz",

                        difficulty:
                            "MEDIUM",

                        totalQuestions:
                            10,

                        createdAt:
                            new Date(
                                "2026-08-09T10:00:00.000Z"
                            ),
                    });


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz/document-id-123/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(200);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quiz fetched successfully"
                );


                // Assert data
                expect(
                    response.body.data
                ).toEqual({
                    id: "quiz-id-123",

                    user: {
                        id: "user-id-123",
                        username: "testuser",
                    },

                    document: {
                        id: "document-id-123",
                        fileName: "javascript.pdf",
                    },

                    quizTitle:
                        "JavaScript Quiz",

                    difficulty:
                        "MEDIUM",

                    totalQuestions:
                        10,

                    createdAt:
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
                        username: true,
                    },
                });


                // Document lookup
                expect(
                    mockDocumentsFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        id: "document-id-123",
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
                        documentId: "document-id-123",
                        userId: "user-id-123",
                    },

                    select: {
                        id: true,

                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },

                        document: {
                            select: {
                                id: true,
                                fileName: true,
                            },
                        },

                        quizTitle: true,
                        difficulty: true,
                        totalQuestions: true,
                        createdAt: true,
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
                            "/api/v1/quiz/document-id-123/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(404);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "User does not found."
                );


                // Document should not be queried
                expect(
                    mockDocumentsFindFirst
                ).not.toHaveBeenCalled();


                // Quiz should not be queried
                expect(
                    mockQuizzesFindFirst
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when document does not exist",
            async () => {

                // User exists
                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                        username: "testuser",
                    });


                // Document does not exist
                mockDocumentsFindFirst
                    .mockResolvedValue(null);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz/document-id-123/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(404);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Document does not exsist."
                );


                // Quiz should not be queried
                expect(
                    mockQuizzesFindFirst
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
                        username: "testuser",
                    });


                // Document exists
                mockDocumentsFindFirst
                    .mockResolvedValue({
                        id: "document-id-123",
                    });


                // Quiz does not exist
                mockQuizzesFindFirst
                    .mockResolvedValue(null);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz/document-id-123/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(404);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quiz not found."
                );


                // Quiz lookup should happen
                expect(
                    mockQuizzesFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        id: "quiz-id-123",
                        documentId:
                            "document-id-123",
                        userId:
                            "user-id-123",
                    },

                    select: {
                        id: true,

                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },

                        document: {
                            select: {
                                id: true,
                                fileName: true,
                            },
                        },

                        quizTitle: true,
                        difficulty: true,
                        totalQuestions: true,
                        createdAt: true,
                    },
                });
            }
        );
    }
);
