import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockQuizzesFindFirst,
    mockQuizQuestionsFindMany,
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
    "GET /api/v1/quiz-questions/:quizId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        it(
            "should fetch all quiz questions successfully",
            async () => {

                // Arrange

                // Quiz exists
                mockQuizzesFindFirst
                    .mockResolvedValue({
                        id: "quiz-id-123",
                    });


                // Quiz questions exist
                mockQuizQuestionsFindMany
                    .mockResolvedValue([
                        {
                            id: "question-id-1",

                            quizId:
                                "quiz-id-123",

                            question:
                                "What is JavaScript?",

                            optionA:
                                "Programming language",

                            optionB:
                                "Database",

                            optionC:
                                "Operating system",

                            optionD:
                                "Browser",

                            correctOption:
                                "A",

                            explanation:
                                "JavaScript is a programming language.",
                        },

                        {
                            id: "question-id-2",

                            quizId:
                                "quiz-id-123",

                            question:
                                "Which keyword declares a constant?",

                            optionA:
                                "var",

                            optionB:
                                "let",

                            optionC:
                                "const",

                            optionD:
                                "static",

                            correctOption:
                                "C",

                            explanation:
                                "const is used to declare constants.",
                        },
                    ]);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz-questions/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(200);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quiz questions fetched successfully."
                );


                // Assert response data
                expect(
                    response.body.data
                ).toEqual([
                    {
                        id: "question-id-1",

                        quizId:
                            "quiz-id-123",

                        question:
                            "What is JavaScript?",

                        optionA:
                            "Programming language",

                        optionB:
                            "Database",

                        optionC:
                            "Operating system",

                        optionD:
                            "Browser",

                        correctOption:
                            "A",

                        explanation:
                            "JavaScript is a programming language.",
                    },

                    {
                        id: "question-id-2",

                        quizId:
                            "quiz-id-123",

                        question:
                            "Which keyword declares a constant?",

                        optionA:
                            "var",

                        optionB:
                            "let",

                        optionC:
                            "const",

                        optionD:
                            "static",

                        correctOption:
                            "C",

                        explanation:
                            "const is used to declare constants.",
                    },
                ]);


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


                // Quiz questions lookup
                expect(
                    mockQuizQuestionsFindMany
                ).toHaveBeenCalledWith({
                    where: {
                        quizId:
                            "quiz-id-123",
                    },
                });
            }
        );


        it(
            "should return 404 when quiz does not exist",
            async () => {

                // Quiz does not exist
                mockQuizzesFindFirst
                    .mockResolvedValue(null);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz-questions/quiz-id-123"
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


                // Questions should not be fetched
                expect(
                    mockQuizQuestionsFindMany
                ).not.toHaveBeenCalled();
            }
        );


        it(
            "should return 404 when quiz questions are not found",
            async () => {

                // Quiz exists
                mockQuizzesFindFirst
                    .mockResolvedValue({
                        id: "quiz-id-123",
                    });


                // No quiz questions
                mockQuizQuestionsFindMany
                    .mockResolvedValue([]);


                // Act
                const response =
                    await request(app)
                        .get(
                            "/api/v1/quiz-questions/quiz-id-123"
                        );


                // Assert status
                expect(
                    response.status
                ).toBe(404);


                // Assert message
                expect(
                    response.body.message
                ).toBe(
                    "Quiz questions not found."
                );


                // Quiz questions lookup
                expect(
                    mockQuizQuestionsFindMany
                ).toHaveBeenCalledWith({
                    where: {
                        quizId:
                            "quiz-id-123",
                    },
                });
            }
        );
    }
);
