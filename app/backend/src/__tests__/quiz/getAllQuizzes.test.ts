import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockQuizzesFindMany,
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
    "GET /api/v1/quiz/:documentId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should fetch all quizzes successfully",
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


                // Quizzes exist
                mockQuizzesFindMany
                    .mockResolvedValue([
                        {
                            id: "quiz-id-123",
                            userId: "user-id-123",
                            documentId: "document-id-123",
                            quizTitle: "JavaScript Quiz",
                            difficulty: "MEDIUM",
                            totalQuestions: 10,
                        },
                        {
                            id: "quiz-id-456",
                            userId: "user-id-123",
                            documentId: "document-id-123",
                            quizTitle: "React Quiz",
                            difficulty: "HARD",
                            totalQuestions: 15,
                        },
                    ]);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz/document-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(200);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quzzes fetched successfully."
                );


                // Assert data
                expect(
                    response.body.data
                ).toEqual([
                    {
                        id: "quiz-id-123",
                        userId: "user-id-123",
                        documentId: "document-id-123",
                        quizTitle: "JavaScript Quiz",
                        difficulty: "MEDIUM",
                        totalQuestions: 10,
                    },
                    {
                        id: "quiz-id-456",
                        userId: "user-id-123",
                        documentId: "document-id-123",
                        quizTitle: "React Quiz",
                        difficulty: "HARD",
                        totalQuestions: 15,
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
                    mockQuizzesFindMany
                ).toHaveBeenCalledWith({
                    where: {
                        userId: "user-id-123",
                        documentId: "document-id-123",
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
                            "/api/v1/quiz/document-id-123"
                        );


                // Assert
                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "User does not found."
                );


                expect(
                    mockDocumentsFindFirst
                ).not.toHaveBeenCalled();


                expect(
                    mockQuizzesFindMany
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
                            "/api/v1/quiz/document-id-123"
                        );


                // Assert
                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Document does not exsist."
                );


                expect(
                    mockQuizzesFindMany
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when quizzes are not found",
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


                // No quizzes
                mockQuizzesFindMany
                    .mockResolvedValue([]);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz/document-id-123"
                        );


                // Assert
                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Quizzes not found."
                );


                expect(
                    mockQuizzesFindMany
                ).toHaveBeenCalledWith({
                    where: {
                        userId: "user-id-123",
                        documentId: "document-id-123",
                    },
                });
            }
        );
    }
);
