import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockDocumentsFindFirst,
    mockChatMessagesCreate,

    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

// Register mocks
setupPrismaMock();
setupAuthMiddlwareMock();

// Mock fetch
const mockFetch = jest.fn<typeof fetch>();

global.fetch = mockFetch as typeof fetch;

// Import app after mocks
const { default: app } = await import("../../app.js");

describe("POST /api/v1/chat/:documentId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should send message and receive AI response", async () => {
        // Arrange
        mockDocumentsFindFirst.mockResolvedValue({
            id: "document-id-123",
        });

        mockChatMessagesCreate
            .mockResolvedValueOnce({
                id: "user-message-id",
                message: "What is AI?",
            })
            .mockResolvedValueOnce({
                id: "ai-message-id",
                message: "Artificial Intelligence is the simulation of human intelligence.",
            });

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                answer: "AI response",
            }),
        } as Response);

        // Act
        const response = await request(app)
            .post("/api/v1/chat/document-id-123")
            .send({
                message: "What is AI?",
            });

        // Assert
        expect(response.status).toBe(201);

        expect(response.body.message).toBe(
            "AI Message sent."
        );

        expect(response.body.data).toEqual({
            id: "ai-message-id",
            message:
                "Artificial Intelligence is the simulation of human intelligence.",
        });

        expect(mockDocumentsFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: "document-id-123",
                },
            })
        );

        expect(mockChatMessagesCreate).toHaveBeenCalledTimes(2);

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/v1/internal/chat"),
            expect.objectContaining({
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            })
        );
    });

    it("should return 404 if document does not exist", async () => {
        mockDocumentsFindFirst.mockResolvedValue(null);

        const response = await request(app)
            .post("/api/v1/chat/document-id-123")
            .send({
                message: "Hello",
            });

        expect(response.status).toBe(404);

        expect(response.body.message).toBe(
            "Document does not exsists"
        );

        expect(mockChatMessagesCreate).not.toHaveBeenCalled();
    });

    it("should return AI service error", async () => {
        mockDocumentsFindFirst.mockResolvedValue({
            id: "document-id-123",
        });

        mockChatMessagesCreate.mockResolvedValueOnce({
            id: "user-message-id",
            message: "Hello",
        });

        mockFetch.mockResolvedValue({
            ok: false,
        } as Response);

        const response = await request(app)
            .post("/api/v1/chat/document-id-123")
            .send({
                message: "Hello",
            });

        expect(response.status).toBe(404);

        expect(response.body.message).toBe(
            "AI Service Error"
        );
    });

    it("should return 404 when AI returns no answer", async () => {
        mockDocumentsFindFirst.mockResolvedValue({
            id: "document-id-123",
        });

        mockChatMessagesCreate.mockResolvedValueOnce({
            id: "user-message-id",
            message: "Hello",
        });

        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => null,
        } as Response);

        const response = await request(app)
            .post("/api/v1/chat/document-id-123")
            .send({
                message: "Hello",
            });

        expect(response.status).toBe(404);

        expect(response.body.message).toBe(
            "Answer not found"
        );
    });
});