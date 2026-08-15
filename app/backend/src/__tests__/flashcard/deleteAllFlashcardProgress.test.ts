import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockFlashcardsFindFirst,
    mockFlashcardProgressDeleteMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("DELETE /api/v1/flashcard-progress/:flashcardId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete all flashcard progress records successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue({ id: "card-id-123" });

        mockFlashcardProgressDeleteMany.mockResolvedValue({
            count: 5,
        });

        const response = await request(app).delete(
            "/api/v1/flashcard-progress/card-id-123"
        );

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Flashcard progresses deleted successfully.");
        expect(response.body.data).toEqual({
            count: 5,
        });

        expect(mockFlashcardProgressDeleteMany).toHaveBeenCalledWith({
            where: {
                flashcardId: "card-id-123",
            },
        });
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).delete(
            "/api/v1/flashcard-progress/card-id-123"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when flashcard does not exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue(null);

        const response = await request(app).delete(
            "/api/v1/flashcard-progress/card-id-123"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Flashcard does not exists.");
    });

    it("should return 404 when no progress records were deleted", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue({ id: "card-id-123" });
        mockFlashcardProgressDeleteMany.mockResolvedValue({ count: 0 });

        const response = await request(app).delete(
            "/api/v1/flashcard-progress/card-id-123"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Flashcard progresses failed to delete.");
    });
});
