import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockQuizzesCreate,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

// Setup mocks before importing app
setupPrismaMock();
setupAuthMiddlwareMock();

// Import app after registering mocks
const { default: app } = await import("../../app.js");

describe(
    "POST /api/v1/quiz/:documentId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();

            process.env.AI_SERVICE_URL =
                "http://localhost:8000";

            global.fetch = jest.fn<typeof fetch>();
        });


        it(
            "should create quiz successfully",
            async () => {

                // Arrange

                // User exists
                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });


                // Document exists
                mockDocumentsFindFirst
                    .mockResolvedValue({
                        id: "document-id-123",
                    });


                // Quiz created
                mockQuizzesCreate
                    .mockResolvedValue({
                        id: "quiz-id-123",

                        user: {
                            id: "user-id-123",
                            username: "testuser",
                        },

                        document: {
                            id: "document-id-123",
                            fileName: "javascript.pdf",
                            fileType: "pdf",
                        },

                        quizTitle:
                            "JavaScript Quiz",

                        difficulty:
                            "MEDIUM",

                        totalQuestions: 10,
                    });


                // AI service response
                (
                    global.fetch as jest.MockedFunction<
                        typeof fetch
                    >
                ).mockResolvedValue({
                    ok: true,

                    json: async () => ({
                        questions: [
                            {
                                question:
                                    "What is JavaScript?",

                                option_a:
                                    "Programming language",

                                option_b:
                                    "Database",

                                option_c:
                                    "Operating system",

                                option_d:
                                    "Browser",

                                correct_option:
                                    "A",

                                explanation:
                                    "JavaScript is a programming language.",
                            },
                        ],
                    }),
                } as Response);


                // Act
                const response =
                    await request(app)
                        .post(
                            "/api/v1/quiz/document-id-123"
                        )
                        .send({
                            quizTitle:
                                "JavaScript Quiz",

                            difficulty:
                                "MEDIUM",

                            totalQuestions:
                                10,
                        });


                // Assert status
                expect(
                    response.status
                ).toBe(201);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quiz created successfully."
                );


                // Assert response data
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
                        fileType: "pdf",
                    },

                    quizTitle:
                        "JavaScript Quiz",

                    difficulty:
                        "MEDIUM",

                    totalQuestions:
                        10,
                });


                // User check
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


                // Document check
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


                // Quiz creation
                expect(
                    mockQuizzesCreate
                ).toHaveBeenCalledWith({
                    data: {
                        userId:
                            "user-id-123",

                        documentId:
                            "document-id-123",

                        quizTitle:
                            "JavaScript Quiz",

                        difficulty:
                            "MEDIUM",

                        totalQuestions:
                            10,
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
                                fileType: true,
                            },
                        },

                        quizTitle: true,
                        difficulty: true,
                        totalQuestions: true,
                    },
                });


                // AI service
                expect(
                    global.fetch
                ).toHaveBeenCalledWith(
                    "http://localhost:8000/api/v1/internal/quiz",

                    expect.objectContaining({
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            document_id:
                                "document-id-123",

                            total_questions:
                                10,

                            difficulty:
                                "MEDIUM",
                        }),

                        signal:
                            expect.any(
                                AbortSignal
                            ),
                    })
                );
            }
        );


        it(
            "should return 404 when user does not exist",
            async () => {

                // User does not exist
                mockFindFirst
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/quiz/document-id-123"
                        )
                        .send({
                            quizTitle:
                                "JavaScript Quiz",

                            difficulty:
                                "MEDIUM",

                            totalQuestions:
                                10,
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "User does not exists."
                );


                expect(
                    mockDocumentsFindFirst
                ).not.toHaveBeenCalled();


                expect(
                    mockQuizzesCreate
                ).not.toHaveBeenCalled();


                expect(
                    global.fetch
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
                    });


                // Document does not exist
                mockDocumentsFindFirst
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/quiz/document-id-123"
                        )
                        .send({
                            quizTitle:
                                "JavaScript Quiz",

                            difficulty:
                                "MEDIUM",

                            totalQuestions:
                                10,
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Document does not exsits."
                );


                expect(
                    mockQuizzesCreate
                ).not.toHaveBeenCalled();


                expect(
                    global.fetch
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when AI service fails",
            async () => {

                // User exists
                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });


                // Document exists
                mockDocumentsFindFirst
                    .mockResolvedValue({
                        id: "document-id-123",
                    });


                // Quiz created
                mockQuizzesCreate
                    .mockResolvedValue({
                        id: "quiz-id-123",

                        user: {
                            id: "user-id-123",
                            username: "testuser",
                        },

                        document: {
                            id: "document-id-123",
                            fileName:
                                "javascript.pdf",

                            fileType:
                                "pdf",
                        },

                        quizTitle:
                            "JavaScript Quiz",

                        difficulty:
                            "MEDIUM",

                        totalQuestions:
                            10,
                    });


                // AI service fails
                (
                    global.fetch as jest.MockedFunction<
                        typeof fetch
                    >
                ).mockResolvedValue({
                    ok: false,
                } as Response);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/quiz/document-id-123"
                        )
                        .send({
                            quizTitle:
                                "JavaScript Quiz",

                            difficulty:
                                "MEDIUM",

                            totalQuestions:
                                10,
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "AI Service Error"
                );
            }
        );


        it(
            "should return 500 when quiz creation fails",
            async () => {

                // User exists
                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });


                // Document exists
                mockDocumentsFindFirst
                    .mockResolvedValue({
                        id: "document-id-123",
                    });


                // Quiz creation fails
                mockQuizzesCreate
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/quiz/document-id-123"
                        )
                        .send({
                            quizTitle:
                                "JavaScript Quiz",

                            difficulty:
                                "MEDIUM",

                            totalQuestions:
                                10,
                        });


                expect(
                    response.status
                ).toBe(500);


                expect(
                    response.body.success
                ).toBe(
                    false
                );


                expect(
                    global.fetch
                ).not.toHaveBeenCalled();
            }
        );
    }
);
