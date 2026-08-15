import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockNotesDelete,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("DELETE /api/v1/notes/:documentId/:noteId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete note by ID successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue({ id: "document-id-123" });

        mockNotesDelete.mockResolvedValue({
            id: "note-id-123",
        });

        const response = await request(app).delete("/api/v1/notes/document-id-123/note-id-123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Note deleted successfully.");
        expect(response.body.data).toEqual({
            id: "note-id-123",
        });

        expect(mockNotesDelete).toHaveBeenCalledWith({
            where: {
                id: "note-id-123",
                documentId: "document-id-123",
                userId: "user-id-123",
            },
            select: {
                id: true,
            },
        });
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).delete("/api/v1/notes/document-id-123/note-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when document does not exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue(null);

        const response = await request(app).delete("/api/v1/notes/document-id-123/note-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Document does not exists.");
    });

    it("should return 404 when note fails to delete", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue({ id: "document-id-123" });
        mockNotesDelete.mockResolvedValue(null);

        const response = await request(app).delete("/api/v1/notes/document-id-123/note-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Failed to delete the note.");
    });
});
