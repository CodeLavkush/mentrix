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
    mockFlashcardSetsDeleteMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } =
    await import("../../app.js");


describe(
    "DELETE /api/v1/flashcardsets/:quizAttemptId",
    () => {

        beforeEach(() => {
            jest.clearAllMocks();
        });


        // ==================================================
        // SUCCESS
        // ==================================================

        it(
            "should delete all flashcard sets successfully",
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


                // Flashcard sets deleted
                mockFlashcardSetsDeleteMany
                    .mockResolvedValue({
                        count: 3,
                    });


                const response =
                    await request(app)
                        .delete(
                            "/api/v1/flashcardsets/attempt-id-123"
                        );


                // Status
                expect(
                    response.status
                ).toBe(200);


                // Message
                expect(
                    response.body.message
                ).toBe(
                    "Flashcard deleted successfully."
                );


                // Data
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
                    },
                });


                // Quiz attempt lookup
                expect(
                    mockQuizAttemptsFindFirst
                ).toHaveBeenCalledWith({
                    where: {
                        id: "attempt-id-123",
                        userId: "user-id-123",
                    },
                    select: {
                        id: true,
                    },
                });


                // Delete many
                expect(
                    mockFlashcardSetsDeleteMany
                ).toHaveBeenCalledWith({
                    where: {
                        userId: "user-id-123",
                        quizAttemptId: "attempt-id-123",
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
                            "/api/v1/flashcardsets/attempt-id-123"
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
                    mockFlashcardSetsDeleteMany
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
                        id: "user-id-123",
                    });


                mockQuizAttemptsFindFirst
                    .mockResolvedValue(null);


                const response =
                    await request(app)
                        .delete(
                            "/api/v1/flashcardsets/attempt-id-123"
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
                    mockFlashcardSetsDeleteMany
                ).not.toHaveBeenCalled();
            }
        );


        // ==================================================
        // NO FLASHCARD SETS
        // ==================================================

        it(
            "should return 404 when no flashcard sets are deleted",
            async () => {

                mockFindFirst
                    .mockResolvedValue({
                        id: "user-id-123",
                    });


                mockQuizAttemptsFindFirst
                    .mockResolvedValue({
                        id: "attempt-id-123",
                    });


                mockFlashcardSetsDeleteMany
                    .mockResolvedValue({
                        count: 0,
                    });


                const response =
                    await request(app)
                        .delete(
                            "/api/v1/flashcardsets/attempt-id-123"
                        );


                expect(
                    response.status
                ).toBe(404);


                expect(
                    response.body.message
                ).toBe(
                    "Flashcard sets falied to delete."
                );
            }
        );
    }
);