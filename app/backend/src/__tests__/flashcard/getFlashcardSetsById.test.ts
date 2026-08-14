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
    mockFlashcardSetsFindFirst,
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
    "GET /api/v1/flashcardsets/:quizAttemptId/:flashcardSetsId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        // ==================================================
        // SUCCESS
        // ==================================================

        it(
            "should fetch flashcard set successfully",
            async () => {

                // ------------------------------------------
                // User exists
                // ------------------------------------------

                mockFindFirst.mockResolvedValue({
                    id: "user-id-123",
                });


                // ------------------------------------------
                // Quiz attempt exists
                // ------------------------------------------

                mockQuizAttemptsFindFirst
                    .mockResolvedValue({
                        id: "attempt-id-123",
                    });


                // ------------------------------------------
                // Flashcard set exists
                // ------------------------------------------

                mockFlashcardSetsFindFirst
                    .mockResolvedValue({
                        id:
                            "flashcard-set-id-123",

                        title:
                            "JavaScript Flashcards",

                        topic:
                            "JavaScript",

                        totalCards:
                            10,

                        quizAttemptId:
                            "attempt-id-123",

                        user: {
                            id:
                                "user-id-123",

                            username:
                                "testuser",
                        },

                        createdAt:
                            new Date(
                                "2026-08-14T10:00:00.000Z"
                            ),

                        updatedAt:
                            new Date(
                                "2026-08-14T10:00:00.000Z"
                            ),
                    });


                // ------------------------------------------
                // Request
                // ------------------------------------------

                const response =
                    await request(app)
                        .get(
                            "/api/v1/flashcardsets/attempt-id-123/flashcard-set-id-123"
                        );


                // ------------------------------------------
                // Status
                // ------------------------------------------

                expect(
                    response.status
                ).toBe(200);


                // ------------------------------------------
                // Message
                // ------------------------------------------

                expect(
                    response.body.message
                ).toBe(
                    "Flashcard sets fetched successfully."
                );


                // ------------------------------------------
                // Response data
                // ------------------------------------------

                expect(
                    response.body.data
                ).toMatchObject({
                    id:
                        "flashcard-set-id-123",

                    title:
                        "JavaScript Flashcards",

                    topic:
                        "JavaScript",

                    totalCards:
                        10,

                    quizAttemptId:
                        "attempt-id-123",

                    user: {
                        id:
                            "user-id-123",

                        username:
                            "testuser",
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
                    },
                });


                // ------------------------------------------
                // Flashcard set lookup
                // ------------------------------------------

                expect(
                    mockFlashcardSetsFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        userId:
                            "user-id-123",

                        quizAttemptId:
                            "attempt-id-123",

                        id:
                            "flashcard-set-id-123",
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

                        quizAttemptId:
                            true,

                        user: {
                            select: {
                                id:
                                    true,

                                username:
                                    true,
                            },
                        },

                        createdAt:
                            true,

                        updatedAt:
                            true,
                    },
                });
            }
        );


        // ==================================================
        // USER NOT FOUND
        // ==================================================

        it(
            "should return 404 when user does not exist",
            async () => {

                mockFindFirst
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .get(
                            "/api/v1/flashcardsets/attempt-id-123/flashcard-set-id-123"
                        );


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
                    mockFlashcardSetsFindFirst
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // QUIZ ATTEMPT NOT FOUND
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
                        .get(
                            "/api/v1/flashcardsets/attempt-id-123/flashcard-set-id-123"
                        );


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Quiz attempt not found."
                );


                expect(
                    mockFlashcardSetsFindFirst
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // FLASHCARD SET NOT FOUND
        // ==================================================

        it(
            "should return 404 when flashcard set does not exist",
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
                    });


                mockFlashcardSetsFindFirst
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .get(
                            "/api/v1/flashcardsets/attempt-id-123/flashcard-set-id-123"
                        );


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Flashcard sets not found"
                );


                expect(
                    mockFlashcardSetsFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        userId:
                            "user-id-123",

                        quizAttemptId:
                            "attempt-id-123",

                        id:
                            "flashcard-set-id-123",
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

                        quizAttemptId:
                            true,

                        user: {
                            select: {
                                id:
                                    true,

                                username:
                                    true,
                            },
                        },

                        createdAt:
                            true,

                        updatedAt:
                            true,
                    },
                });
            }
        );
    }
);