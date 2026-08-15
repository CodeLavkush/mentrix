import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockFlashcardsFindFirst,
    mockFlashcardProgressCreate,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("POST /api/v1/flashcard-progress/:flashcardId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create flashcard progress successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue({ id: "card-id-123" });

        mockFlashcardProgressCreate.mockResolvedValue({
            id: "progress-id-123",
            reviewCount: 5,
            correctCount: 4,
            lastReviewed: "2026-08-15T00:00:00.000Z",
            masteryLevel: "80.00",
            flashcardId: "card-id-123",
            user: {
                id: "user-id-123",
                username: "testuser",
            },
        });

        const response = await request(app)
            .post("/api/v1/flashcard-progress/card-id-123")
            .send({
                reviewCount: 5,
                correctCount: 4,
                masteryLevel: 80.0,
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Flashcard progress creation successfully.");
        expect(response.body.data).toEqual({
            id: "progress-id-123",
            reviewCount: 5,
            correctCount: 4,
            lastReviewed: "2026-08-15T00:00:00.000Z",
            masteryLevel: "80.00",
            flashcardId: "card-id-123",
            user: {
                id: "user-id-123",
                username: "testuser",
            },
        });
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app)
            .post("/api/v1/flashcard-progress/card-id-123")
            .send({
                reviewCount: 5,
                correctCount: 4,
                masteryLevel: 80.0,
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when flashcard does not exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue(null);

        const response = await request(app)
            .post("/api/v1/flashcard-progress/card-id-123")
            .send({
                reviewCount: 5,
                correctCount: 4,
                masteryLevel: 80.0,
            });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Flashcard does not exists.");
    });
});
