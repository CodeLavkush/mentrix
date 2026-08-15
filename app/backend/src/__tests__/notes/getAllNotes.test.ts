import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockNotesFindMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("GET /api/v1/notes/:documentId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch all notes successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue({ id: "document-id-123" });

        mockNotesFindMany.mockResolvedValue([
            {
                id: "note-1",
                title: "Chapter 1 Summary",
                content: "Content of chapter 1...",
                documents: {
                    id: "document-id-123",
                    fileName: "chapter1.pdf",
                    fileSize: 1024n,
                    fileType: "application/pdf",
                },
                user: {
                    id: "user-id-123",
                    username: "testuser",
                },
                createdAt: "2026-08-15T00:00:00.000Z",
                updatedAt: "2026-08-15T00:00:00.000Z",
            },
        ]);

        const response = await request(app).get("/api/v1/notes/document-id-123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Notes fetched successfully.");
        expect(response.body.data).toEqual([
            {
                id: "note-1",
                title: "Chapter 1 Summary",
                content: "Content of chapter 1...",
                documents: {
                    id: "document-id-123",
                    fileName: "chapter1.pdf",
                    fileSize: "1024",
                    fileType: "application/pdf",
                },
                user: {
                    id: "user-id-123",
                    username: "testuser",
                },
                createdAt: "2026-08-15T00:00:00.000Z",
                updatedAt: "2026-08-15T00:00:00.000Z",
            },
        ]);
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/notes/document-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when document does not exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/notes/document-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Document does not exists.");
    });

    it("should return 404 when no notes exist for the document", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue({ id: "document-id-123" });
        mockNotesFindMany.mockResolvedValue([]);

        const response = await request(app).get("/api/v1/notes/document-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Notes not found.");
    });
});
