import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockFlashcardSetsFindFirst,
    mockFlashcardProgressFindMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("GET /api/v1/flashcard-progress/set/:flashcardSetId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch all flashcard progress for a set successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardSetsFindFirst.mockResolvedValue({ id: "set-id-123" });

        mockFlashcardProgressFindMany.mockResolvedValue([
            {
                id: "progress-1",
                userId: "user-id-123",
                reviewCount: 4,
                correctCount: 3,
                lastReviewed: "2026-08-15T00:00:00.000Z",
                masteryLevel: "75.00",
                flashcardId: "card-id-1",
            },
            {
                id: "progress-2",
                userId: "user-id-123",
                reviewCount: 5,
                correctCount: 5,
                lastReviewed: "2026-08-15T00:00:00.000Z",
                masteryLevel: "100.00",
                flashcardId: "card-id-2",
            },
        ]);

        const response = await request(app).get("/api/v1/flashcard-progress/set/set-id-123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Flashcard progress fetched successfully.");
        expect(response.body.data).toEqual([
            {
                id: "progress-1",
                userId: "user-id-123",
                reviewCount: 4,
                correctCount: 3,
                lastReviewed: "2026-08-15T00:00:00.000Z",
                masteryLevel: "75.00",
                flashcardId: "card-id-1",
            },
            {
                id: "progress-2",
                userId: "user-id-123",
                reviewCount: 5,
                correctCount: 5,
                lastReviewed: "2026-08-15T00:00:00.000Z",
                masteryLevel: "100.00",
                flashcardId: "card-id-2",
            },
        ]);
    });

    it("should return empty array when no progress records exist for the set", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardSetsFindFirst.mockResolvedValue({ id: "set-id-123" });
        mockFlashcardProgressFindMany.mockResolvedValue([]);

        const response = await request(app).get("/api/v1/flashcard-progress/set/set-id-123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Flashcard progress fetched successfully.");
        expect(response.body.data).toEqual([]);
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/flashcard-progress/set/set-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when flashcard set does not exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardSetsFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/flashcard-progress/set/set-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Flashcard sets does not exists.");
    });
});
