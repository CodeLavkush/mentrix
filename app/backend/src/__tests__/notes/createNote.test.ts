import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockNotesCreate,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("POST /api/v1/notes/:documentId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.AI_SERVICE_URL = "http://localhost:8000";
        global.fetch = jest.fn<typeof fetch>();
    });

    it("should create a note successfully", async () => {
        // User exists
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });

        // Document exists
        mockDocumentsFindFirst.mockResolvedValue({ id: "document-id-123" });

        // Note created
        mockNotesCreate.mockResolvedValue({
            id: "note-id-123",
            title: "Summary Note",
            content: "This is generated summary content.",
            documentId: "document-id-123",
            user: {
                id: "user-id-123",
                username: "testuser",
            },
            createdAt: "2026-08-15T00:00:00.000Z",
            updatedAt: "2026-08-15T00:00:00.000Z",
        });

        // AI service response
        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
            ok: true,
            json: async () => ({
                content: "This is generated summary content.",
            }),
        } as Response);

        const response = await request(app)
            .post("/api/v1/notes/document-id-123")
            .send({
                title: "Summary Note",
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Note created successfully.");
        expect(response.body.data).toEqual({
            id: "note-id-123",
            title: "Summary Note",
            content: "This is generated summary content.",
            documentId: "document-id-123",
            user: {
                id: "user-id-123",
                username: "testuser",
            },
            createdAt: "2026-08-15T00:00:00.000Z",
            updatedAt: "2026-08-15T00:00:00.000Z",
        });

        expect(mockFindFirst).toHaveBeenCalledWith({
            where: { id: "user-id-123" },
            select: { id: true },
        });
        expect(mockDocumentsFindFirst).toHaveBeenCalledWith({
            where: { id: "document-id-123" },
            select: { id: true },
        });
        expect(mockNotesCreate).toHaveBeenCalled();
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app)
            .post("/api/v1/notes/document-id-123")
            .send({ title: "Summary Note" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
        expect(mockDocumentsFindFirst).not.toHaveBeenCalled();
    });

    it("should return 404 when document does not exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue(null);

        const response = await request(app)
            .post("/api/v1/notes/document-id-123")
            .send({ title: "Summary Note" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Document does not exists.");
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should return 404 when AI service returns error", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue({ id: "document-id-123" });

        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
            ok: false,
        } as Response);

        const response = await request(app)
            .post("/api/v1/notes/document-id-123")
            .send({ title: "Summary Note" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("AI Service Error");
    });

    it("should return 404 when AI service response lacks content", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue({ id: "document-id-123" });

        (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as Response);

        const response = await request(app)
            .post("/api/v1/notes/document-id-123")
            .send({ title: "Summary Note" });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Notes cannot be generated.");
    });
});
