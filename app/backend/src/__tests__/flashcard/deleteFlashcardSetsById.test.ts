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
    mockFlashcardSetsDelete,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } =
    await import("../../app.js");


describe(
    "DELETE /api/v1/flashcardsets/:quizAttemptId/:flashcardSetsId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        // ==================================================
        // SUCCESS
        // ==================================================

        it(
            "should delete flashcard set successfully",
            async () => {

                // User exists
                mockFindFirst.mockResolvedValue({
                    id: "user-id-123",
                });


                // Quiz attempt exists
                mockQuizAttemptsFindFirst
                    .mockResolvedValue({
                        id: "attempt-id-123",
                    });


                // Flashcard set deleted
                mockFlashcardSetsDelete
                    .mockResolvedValue({
                        id: "flashcard-set-id-123",

                        title:
                            "JavaScript Flashcards",

                        topic:
                            "JavaScript",

                        totalCards:
                            10,

                        quizAttemptId:
                            "attempt-id-123",

                        userId:
                            "user-id-123",
                    });


                const response =
                    await request(app)
                        .delete(
                            "/api/v1/flashcardsets/attempt-id-123/flashcard-set-id-123"
                        );


                // Status
                expect(
                    response.status
                ).toBe(200);


                // Message
                expect(
                    response.body.message
                ).toBe(
                    "Flashcard sets deleted successfully."
                );


                // Data
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

                    userId:
                        "user-id-123",
                });


                // User lookup
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


                // Quiz attempt lookup
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


                // Delete
                expect(
                    mockFlashcardSetsDelete
                ).toHaveBeenCalledWith({
                    where: {
                        id:
                            "flashcard-set-id-123",

                        quizAttemptId:
                            "attempt-id-123",

                        userId:
                            "user-id-123",
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
                        .delete(
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
                    mockFlashcardSetsDelete
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
                        .delete(
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
                    mockFlashcardSetsDelete
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // DELETE FAILED
        // ==================================================

        it(
            "should return 404 when flashcard set deletion fails",
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


                mockFlashcardSetsDelete
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .delete(
                            "/api/v1/flashcardsets/attempt-id-123/flashcard-set-id-123"
                        );


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Flascard sets failed to delete."
                );


                expect(
                    mockFlashcardSetsDelete
                ).toHaveBeenCalledWith({
                    where: {
                        id:
                            "flashcard-set-id-123",

                        quizAttemptId:
                            "attempt-id-123",

                        userId:
                            "user-id-123",
                    },
                });
            }
        );
    }
);