import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockQuizzesDeleteMany,
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
    "DELETE /api/v1/quiz/:documentId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should delete all quizzes successfully",
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


                // Three quizzes deleted
                mockQuizzesDeleteMany
                    .mockResolvedValue({
                        count: 3,
                    });


                // Act
                const response =
                    await request(app)
                        .delete(
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
                    "Quiz deleted successfully."
                );


                // Assert response data
                expect(
                    response.body.data
                ).toEqual({
                    count: 3,
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


                // Delete quizzes
                expect(
                    mockQuizzesDeleteMany
                ).toHaveBeenCalledWith({
                    where: {
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
                            "/api/v1/quiz/document-id-123"
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


                // Quizzes should not be deleted
                expect(
                    mockQuizzesDeleteMany
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
                            "/api/v1/quiz/document-id-123"
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


                // Quizzes should not be deleted
                expect(
                    mockQuizzesDeleteMany
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when no quizzes are deleted",
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


                // No quizzes deleted
                mockQuizzesDeleteMany
                    .mockResolvedValue({
                        count: 0,
                    });


                // Act
                const response =
                    await request(app)
                        .delete(
                            "/api/v1/quiz/document-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(404);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quizzes failed to delete."
                );


                // Delete was attempted
                expect(
                    mockQuizzesDeleteMany
                ).toHaveBeenCalledWith({
                    where: {
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
