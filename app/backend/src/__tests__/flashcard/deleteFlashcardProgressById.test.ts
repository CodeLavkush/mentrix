import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockFlashcardsFindFirst,
    mockFlashcardProgressDelete,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("DELETE /api/v1/flashcard-progress/:flashcardId/:flashcardProgressId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete flashcard progress by ID successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue({ id: "card-id-123" });

        mockFlashcardProgressDelete.mockResolvedValue({
            id: "progress-id-123",
        });

        const response = await request(app).delete(
            "/api/v1/flashcard-progress/card-id-123/progress-id-123"
        );

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Flashcard progress successfully deleted.");
        expect(response.body.data).toEqual({
            id: "progress-id-123",
        });

        expect(mockFlashcardProgressDelete).toHaveBeenCalledWith({
            where: {
                id: "progress-id-123",
                flashcardId: "card-id-123",
                userId: "user-id-123",
            },
        });
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).delete(
            "/api/v1/flashcard-progress/card-id-123/progress-id-123"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when flashcard does not exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue(null);

        const response = await request(app).delete(
            "/api/v1/flashcard-progress/card-id-123/progress-id-123"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Flashcard does not exists.");
    });

    it("should return 404 when flashcard progress fails to delete", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockFlashcardsFindFirst.mockResolvedValue({ id: "card-id-123" });
        mockFlashcardProgressDelete.mockResolvedValue(null);

        const response = await request(app).delete(
            "/api/v1/flashcard-progress/card-id-123/progress-id-123"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Flashcard progress failed to delete.");
    });
});
