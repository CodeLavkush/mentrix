import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFlashcardSetsFindFirst,
    mockFlashcardsFindMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("GET /api/v1/flashcards/:flashcardSetId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch all flashcards for a set successfully", async () => {
        mockFlashcardSetsFindFirst.mockResolvedValue({ id: "set-id-123" });

        mockFlashcardsFindMany.mockResolvedValue([
            {
                id: "card-1",
                frontText: "What is a Closure?",
                backText: "A function bundled with references to its surrounding state.",
                difficulty: "EASY",
                flashcardSet: {
                    title: "JavaScript Basics",
                    totalCards: 10,
                },
                createdAt: "2026-08-15T00:00:00.000Z",
            },
        ]);

        const response = await request(app).get("/api/v1/flashcards/set-id-123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Flashcards fetched successfully.");
        expect(response.body.data).toEqual([
            {
                id: "card-1",
                frontText: "What is a Closure?",
                backText: "A function bundled with references to its surrounding state.",
                difficulty: "EASY",
                flashcardSet: {
                    title: "JavaScript Basics",
                    totalCards: 10,
                },
                createdAt: "2026-08-15T00:00:00.000Z",
            },
        ]);

        expect(mockFlashcardSetsFindFirst).toHaveBeenCalledWith({
            where: {
                id: "set-id-123",
            },
            select: {
                id: true,
            },
        });
    });

    it("should return 404 when flashcard set does not exist", async () => {
        mockFlashcardSetsFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/flashcards/set-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Flashcard sets does not exists.");
    });

    it("should return 404 when no flashcards exist in the set", async () => {
        mockFlashcardSetsFindFirst.mockResolvedValue({ id: "set-id-123" });
        mockFlashcardsFindMany.mockResolvedValue([]);

        const response = await request(app).get("/api/v1/flashcards/set-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Failed to fetched flashcards.");
    });
});
