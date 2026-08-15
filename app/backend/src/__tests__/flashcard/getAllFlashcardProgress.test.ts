import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockFlashcardsFindFirst,
    mockFlashcardProgressFindMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("GET /api/v1/flashcard-progress/:flashcardId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch all flashcard progress records successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue({ id: "card-id-123" });

        mockFlashcardProgressFindMany.mockResolvedValue([
            {
                id: "progress-1",
                reviewCount: 3,
                correctCount: 2,
                lastReviewed: "2026-08-15T00:00:00.000Z",
                masteryLevel: "66.67",
                flashcardId: "card-id-123",
                user: {
                    id: "user-id-123",
                    username: "testuser",
                },
            },
        ]);

        const response = await request(app).get("/api/v1/flashcard-progress/card-id-123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Flashcard progress fetched successfully.");
        expect(response.body.data).toEqual([
            {
                id: "progress-1",
                reviewCount: 3,
                correctCount: 2,
                lastReviewed: "2026-08-15T00:00:00.000Z",
                masteryLevel: "66.67",
                flashcardId: "card-id-123",
                user: {
                    id: "user-id-123",
                    username: "testuser",
                },
            },
        ]);
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/flashcard-progress/card-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when flashcard does not exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/flashcard-progress/card-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Flashcard does not exists.");
    });

    it("should return 404 when no progress records exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue({ id: "card-id-123" });
        mockFlashcardProgressFindMany.mockResolvedValue([]);

        const response = await request(app).get("/api/v1/flashcard-progress/card-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Flashcard progress not found.");
    });
});
