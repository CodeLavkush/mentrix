import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockQuizzesDelete,
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
    "DELETE /api/v1/quiz/:documentId/:quizId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should delete quiz successfully",
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


                // Quiz deleted
                mockQuizzesDelete
                    .mockResolvedValue({
                        id: "quiz-id-123",
                        userId: "user-id-123",
                        documentId: "document-id-123",
                        quizTitle: "JavaScript Quiz",
                        difficulty: "MEDIUM",
                        totalQuestions: 10,
                    });


                // Act
                const response =
                    await request(app)
                        .delete(
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
                    "Quiz deleted successfully."
                );


                // Assert deleted quiz
                expect(
                    response.body.data
                ).toEqual({
                    id: "quiz-id-123",
                    userId: "user-id-123",
                    documentId: "document-id-123",
                    quizTitle: "JavaScript Quiz",
                    difficulty: "MEDIUM",
                    totalQuestions: 10,
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


                // Quiz deletion
                expect(
                    mockQuizzesDelete
                ).toHaveBeenCalledWith({
                    where: {
                        id: "quiz-id-123",
                        documentId:
                            "document-id-123",
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
                        .delete(
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


                // Quiz should not be deleted
                expect(
                    mockQuizzesDelete
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
                        .delete(
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


                // Quiz should not be deleted
                expect(
                    mockQuizzesDelete
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when quiz deletion fails",
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


                // Delete returns null
                mockQuizzesDelete
                    .mockResolvedValue(null);


                // Act
                const response =
                    await request(app)
                        .delete(
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
                    "Quiz failed to delete."
                );


                // Delete was attempted
                expect(
                    mockQuizzesDelete
                ).toHaveBeenCalledWith({
                    where: {
                        id: "quiz-id-123",
                        documentId:
                            "document-id-123",
                        userId:
                            "user-id-123",
                    },
                });
            }
        );
    }
);
