import request from "supertest";

import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
} from "@jest/globals";

import {
    mockFindFirst,
    mockQuizAttemptsFindFirst,
    mockQuizQuestionsFindMany,
    mockFlashcardSetsFindFirst,
    mockFlashcardSetsCreate,
    mockFlashcardsCreate,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";


// --------------------------------------------------
// Setup mocks BEFORE importing app
// --------------------------------------------------

setupPrismaMock();

setupAuthMiddlwareMock();


// --------------------------------------------------
// Import app AFTER mocks
// --------------------------------------------------

const { default: app } =
    await import("../../app.js");


// --------------------------------------------------
// Test suite
// --------------------------------------------------

describe(
    "POST /api/v1/flashcardsets/:quizAttemptId",
    () => {

        let mockFetch:
            jest.MockedFunction<typeof fetch>;


        // --------------------------------------------------
        // Mock Response helper
        // --------------------------------------------------

        const createMockResponse = (
            data: object,
            ok = true
        ): Response => {

            return {
                ok,

                json: async () => data,

            } as Response;
        };


        // --------------------------------------------------
        // Before each
        // --------------------------------------------------

        beforeEach(() => {

            jest.clearAllMocks();


            mockFetch =
                jest.fn() as jest.MockedFunction<
                    typeof fetch
                >;


            global.fetch =
                mockFetch;


            process.env.AI_SERVICE_URL =
                "http://localhost:8000";
        });


        // ==================================================
        // 1. SUCCESS
        // ==================================================

        it(
            "should create flashcard set successfully",
            async () => {

                // ------------------------------------------
                // User exists
                // ------------------------------------------

                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });


                // ------------------------------------------
                // Quiz attempt exists
                // ------------------------------------------

                mockQuizAttemptsFindFirst
                    .mockResolvedValue({
                        id:
                            "attempt-id-123",

                        quizId:
                            "quiz-id-123",
                    });


                // ------------------------------------------
                // Quiz questions exist
                // ------------------------------------------

                mockQuizQuestionsFindMany
                    .mockResolvedValue([
                        {
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
                    ]);


                // ------------------------------------------
                // No existing flashcard set
                // ------------------------------------------

                mockFlashcardSetsFindFirst
                    .mockResolvedValue(null);


                // ------------------------------------------
                // AI service response
                // ------------------------------------------

                mockFetch.mockResolvedValue(
                    createMockResponse({
                        flashcards: [
                            {
                                front_text:
                                    "What is JavaScript?",

                                back_text:
                                    "A programming language",

                                difficulty:
                                    "EASY",
                            },
                        ],
                    })
                );


                // ------------------------------------------
                // Flashcard set created
                // ------------------------------------------

                mockFlashcardSetsCreate
                    .mockResolvedValue({
                        id:
                            "flashcard-set-id-123",

                        title:
                            "JavaScript Flashcards",

                        topic:
                            "JavaScript",

                        totalCards:
                            10,

                        user: {
                            id:
                                "user-id-123",

                            username:
                                "testuser",
                        },

                        quizAttempt: {
                            id:
                                "attempt-id-123",

                            score:
                                8,
                        },
                    });


                // ------------------------------------------
                // Individual flashcard created
                // ------------------------------------------

                mockFlashcardsCreate
                    .mockResolvedValue({
                        id:
                            "flashcard-id-123",
                    });


                // ------------------------------------------
                // Request
                // ------------------------------------------

                const response =
                    await request(app)
                        .post(
                            "/api/v1/flashcardsets/attempt-id-123"
                        )
                        .send({
                            title:
                                "JavaScript Flashcards",

                            topic:
                                "JavaScript",

                            totalCards:
                                10,
                        });


                // ------------------------------------------
                // Status
                // ------------------------------------------

                expect(
                    response.status
                ).toBe(201);


                // ------------------------------------------
                // Message
                // ------------------------------------------

                expect(
                    response.body.message
                ).toBe(
                    "Flashcard set created succesfully."
                );


                // ------------------------------------------
                // Response data
                // ------------------------------------------

                expect(
                    response.body.data
                ).toEqual({
                    id:
                        "flashcard-set-id-123",

                    title:
                        "JavaScript Flashcards",

                    topic:
                        "JavaScript",

                    totalCards:
                        10,

                    user: {
                        id:
                            "user-id-123",

                        username:
                            "testuser",
                    },

                    quizAttempt: {
                        id:
                            "attempt-id-123",

                        score:
                            8,
                    },
                });


                // ------------------------------------------
                // User lookup
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
                // Quiz attempt lookup
                // ------------------------------------------

                expect(
                    mockQuizAttemptsFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        id:
                            "attempt-id-123",

                        userId:
                            "user-id-123",
                    },

                    select: {
                        id:
                            true,

                        quizId:
                            true,
                    },
                });


                // ------------------------------------------
                // Quiz questions lookup
                // ------------------------------------------

                expect(
                    mockQuizQuestionsFindMany
                ).toHaveBeenCalledWith({
                    where: {
                        quizId:
                            "quiz-id-123",
                    },

                    select: {
                        question:
                            true,

                        optionA:
                            true,

                        optionB:
                            true,

                        optionC:
                            true,

                        optionD:
                            true,

                        correctOption:
                            true,

                        explanation:
                            true,
                    },
                });


                // ------------------------------------------
                // Existing flashcard set check
                // ------------------------------------------

                expect(
                    mockFlashcardSetsFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        quizAttemptId:
                            "attempt-id-123",
                    },

                    select: {
                        id:
                            true,
                    },
                });


                // ------------------------------------------
                // AI service
                // ------------------------------------------

                expect(
                    mockFetch
                ).toHaveBeenCalledWith(
                    "http://localhost:8000/api/v1/internal/flashcard",

                    expect.objectContaining({
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body:
                            JSON.stringify({
                                quiz_questions: [
                                    {
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
                                ],

                                total_cards:
                                    10,
                            }),

                        signal:
                            expect.any(
                                AbortSignal
                            ),
                    })
                );


                // ------------------------------------------
                // Flashcard set creation
                // ------------------------------------------

                expect(
                    mockFlashcardSetsCreate
                ).toHaveBeenCalledWith({
                    data: {
                        userId:
                            "user-id-123",

                        quizAttemptId:
                            "attempt-id-123",

                        title:
                            "JavaScript Flashcards",

                        topic:
                            "JavaScript",

                        totalCards:
                            10,
                    },

                    select: {
                        id:
                            true,

                        title:
                            true,

                        topic:
                            true,

                        totalCards:
                            true,

                        user: {
                            select: {
                                id:
                                    true,

                                username:
                                    true,
                            },
                        },

                        quizAttempt: {
                            select: {
                                id:
                                    true,

                                score:
                                    true,
                            },
                        },
                    },
                });


                // ------------------------------------------
                // Flashcard creation
                // ------------------------------------------

                expect(
                    mockFlashcardsCreate
                ).toHaveBeenCalledWith({
                    data: {
                        flashcardSetId:
                            "flashcard-set-id-123",

                        frontText:
                            "What is JavaScript?",

                        backText:
                            "A programming language",

                        difficulty:
                            "EASY",
                    },
                });
            }
        );


        // ==================================================
        // 2. USER NOT FOUND
        // ==================================================

        it(
            "should return 404 when user does not exist",
            async () => {

                mockFindFirst
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/flashcardsets/attempt-id-123"
                        )
                        .send({
                            title:
                                "JavaScript Flashcards",

                            topic:
                                "JavaScript",

                            totalCards:
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
                    mockQuizAttemptsFindFirst
                ).not.toHaveBeenCalled();


                expect(
                    mockFetch
                ).not.toHaveBeenCalled();


                expect(
                    mockFlashcardSetsCreate
                ).not.toHaveBeenCalled();


                expect(
                    mockFlashcardsCreate
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // 3. QUIZ ATTEMPT NOT FOUND
        // ==================================================

        it(
            "should return 404 when quiz attempt does not exist",
            async () => {

                mockFindFirst
                    .mockResolvedValue({
                        id:
                            "user-id-123",
                    });


                mockQuizAttemptsFindFirst
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/flashcardsets/attempt-id-123"
                        )
                        .send({
                            title:
                                "JavaScript Flashcards",

                            topic:
                                "JavaScript",

                            totalCards:
                                10,
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Quiz attempt not found."
                );


                expect(
                    mockQuizQuestionsFindMany
                ).not.toHaveBeenCalled();


                expect(
                    mockFetch
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // 4. QUIZ QUESTIONS NOT FOUND
        // ==================================================

        it(
            "should return 404 when quiz questions do not exist",
            async () => {

                mockFindFirst
                    .mockResolvedValue({
                        id:
                            "user-id-123",
                    });


                mockQuizAttemptsFindFirst
                    .mockResolvedValue({
                        id:
                            "attempt-id-123",

                        quizId:
                            "quiz-id-123",
                    });


                mockQuizQuestionsFindMany
                    .mockResolvedValue([]);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/flashcardsets/attempt-id-123"
                        )
                        .send({
                            title:
                                "JavaScript Flashcards",

                            topic:
                                "JavaScript",

                            totalCards:
                                10,
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Quiz questions does not exists."
                );


                expect(
                    mockFetch
                ).not.toHaveBeenCalled();


                expect(
                    mockFlashcardSetsCreate
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // 5. FLASHCARD SET ALREADY EXISTS
        // ==================================================

        it(
            "should return 404 when flashcard set already exists",
            async () => {

                mockFindFirst
                    .mockResolvedValue({
                        id:
                            "user-id-123",
                    });


                mockQuizAttemptsFindFirst
                    .mockResolvedValue({
                        id:
                            "attempt-id-123",

                        quizId:
                            "quiz-id-123",
                    });


                mockQuizQuestionsFindMany
                    .mockResolvedValue([
                        {
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
                    ]);


                mockFlashcardSetsFindFirst
                    .mockResolvedValue({
                        id:
                            "existing-set-id",
                    });


                const response =
                    await request(app)
                        .post(
                            "/api/v1/flashcardsets/attempt-id-123"
                        )
                        .send({
                            title:
                                "JavaScript Flashcards",

                            topic:
                                "JavaScript",

                            totalCards:
                                10,
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Flashcard sets already exists."
                );


                expect(
                    mockFetch
                ).not.toHaveBeenCalled();


                expect(
                    mockFlashcardSetsCreate
                ).not.toHaveBeenCalled();


                expect(
                    mockFlashcardsCreate
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // 6. AI SERVICE FAILURE
        // ==================================================

        it(
            "should return 404 when AI service fails",
            async () => {

                mockFindFirst
                    .mockResolvedValue({
                        id:
                            "user-id-123",
                    });


                mockQuizAttemptsFindFirst
                    .mockResolvedValue({
                        id:
                            "attempt-id-123",

                        quizId:
                            "quiz-id-123",
                    });


                mockQuizQuestionsFindMany
                    .mockResolvedValue([
                        {
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
                    ]);


                mockFlashcardSetsFindFirst
                    .mockResolvedValue(null);


                mockFetch.mockResolvedValue(
                    createMockResponse(
                        {},
                        false
                    )
                );


                const response =
                    await request(app)
                        .post(
                            "/api/v1/flashcardsets/attempt-id-123"
                        )
                        .send({
                            title:
                                "JavaScript Flashcards",

                            topic:
                                "JavaScript",

                            totalCards:
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


                expect(
                    mockFlashcardSetsCreate
                ).not.toHaveBeenCalled();


                expect(
                    mockFlashcardsCreate
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // 7. EMPTY AI FLASHCARDS
        // ==================================================

        it(
            "should return 404 when AI returns no flashcards",
            async () => {

                mockFindFirst
                    .mockResolvedValue({
                        id:
                            "user-id-123",
                    });


                mockQuizAttemptsFindFirst
                    .mockResolvedValue({
                        id:
                            "attempt-id-123",

                        quizId:
                            "quiz-id-123",
                    });


                mockQuizQuestionsFindMany
                    .mockResolvedValue([
                        {
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
                    ]);


                mockFlashcardSetsFindFirst
                    .mockResolvedValue(null);


                mockFetch.mockResolvedValue(
                    createMockResponse({
                        flashcards: [],
                    })
                );


                const response =
                    await request(app)
                        .post(
                            "/api/v1/flashcardsets/attempt-id-123"
                        )
                        .send({
                            title:
                                "JavaScript Flashcards",

                            topic:
                                "JavaScript",

                            totalCards:
                                10,
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Flashcards not found"
                );


                expect(
                    mockFlashcardSetsCreate
                ).not.toHaveBeenCalled();


                expect(
                    mockFlashcardsCreate
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // 8. FLASHCARD SET CREATION FAILURE
        // ==================================================

        it(
            "should return 404 when flashcard set creation fails",
            async () => {

                mockFindFirst
                    .mockResolvedValue({
                        id:
                            "user-id-123",
                    });


                mockQuizAttemptsFindFirst
                    .mockResolvedValue({
                        id:
                            "attempt-id-123",

                        quizId:
                            "quiz-id-123",
                    });


                mockQuizQuestionsFindMany
                    .mockResolvedValue([
                        {
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
                    ]);


                mockFlashcardSetsFindFirst
                    .mockResolvedValue(null);


                mockFetch.mockResolvedValue(
                    createMockResponse({
                        flashcards: [
                            {
                                front_text:
                                    "What is JavaScript?",

                                back_text:
                                    "A programming language",

                                difficulty:
                                    "EASY",
                            },
                        ],
                    })
                );


                mockFlashcardSetsCreate
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .post(
                            "/api/v1/flashcardsets/attempt-id-123"
                        )
                        .send({
                            title:
                                "JavaScript Flashcards",

                            topic:
                                "JavaScript",

                            totalCards:
                                10,
                        });


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Flashcard set creation failed."
                );


                expect(
                    mockFlashcardsCreate
                ).not.toHaveBeenCalled();
            }
        );
    }
);