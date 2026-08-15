import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockDocumentsFindFirst,
    mockChatMessagesFindMany,

    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

// Register mocks
setupPrismaMock();
setupAuthMiddlwareMock();

// Import app after mocks
const { default: app } = await import("../../app.js");

describe("GET /api/v1/chat/:documentId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch all messages successfully", async () => {
        // Arrange
        mockDocumentsFindFirst.mockResolvedValue({
            id: "document-id-123",
            fileName: "notes.pdf",
        });

        mockChatMessagesFindMany.mockResolvedValue([
            {
                id: "message-1",
                message: "What is AI?",
                sender: "USER",
                timestamp: "2026-08-02T10:00:00.000Z",
            },
            {
                id: "message-2",
                message: "Artificial Intelligence is the simulation of human intelligence.",
                sender: "AI",
                timestamp: "2026-08-02T10:00:05.000Z",
            },
        ]);

        // Act
        const response = await request(app).get(
            "/api/v1/chat/document-id-123"
        );

        // Assert
        expect(response.status).toBe(200);

        expect(response.body.message).toBe(
            "Messages fetched successfully"
        );

        expect(response.body.data).toEqual({
            document: {
                id: "document-id-123",
                fileName: "notes.pdf",
            },
            messages: [
                {
                    id: "message-1",
                    message: "What is AI?",
                    sender: "USER",
                    timestamp: "2026-08-02T10:00:00.000Z",
                },
                {
                    id: "message-2",
                    message:
                        "Artificial Intelligence is the simulation of human intelligence.",
                    sender: "AI",
                    timestamp: "2026-08-02T10:00:05.000Z",
                },
            ],
        });

        expect(mockDocumentsFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: "document-id-123",
                },
            })
        );

        expect(mockChatMessagesFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    userId: "user-id-123",
                    documentId: "document-id-123",
                },
            })
        );
    });

    it("should return 404 if document does not exist", async () => {
        mockDocumentsFindFirst.mockResolvedValue(null);

        const response = await request(app).get(
            "/api/v1/chat/document-id-123"
        );

        expect(response.status).toBe(404);

        expect(response.body.message).toBe(
            "Document does not exsists"
        );

        expect(mockChatMessagesFindMany).not.toHaveBeenCalled();
    });

    it("should return 404 when no messages exist", async () => {
        mockDocumentsFindFirst.mockResolvedValue({
            id: "document-id-123",
            fileName: "notes.pdf",
        });

        mockChatMessagesFindMany.mockResolvedValue([]);

        const response = await request(app).get(
            "/api/v1/chat/document-id-123"
        );

        expect(response.status).toBe(404);

        expect(response.body.message).toBe(
            "Messages not found."
        );
    });
});