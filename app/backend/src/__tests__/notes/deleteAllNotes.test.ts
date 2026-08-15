import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockNotesDeleteMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("DELETE /api/v1/notes/:documentId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete all notes for a document successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue({ id: "document-id-123" });

        mockNotesDeleteMany.mockResolvedValue({
            count: 3,
        });

        const response = await request(app).delete("/api/v1/notes/document-id-123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Notes deleted successfully.");
        expect(response.body.data).toEqual({
            count: 3,
        });

        expect(mockNotesDeleteMany).toHaveBeenCalledWith({
            where: {
                userId: "user-id-123",
                documentId: "document-id-123",
            },
        });
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).delete("/api/v1/notes/document-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when document does not exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue(null);

        const response = await request(app).delete("/api/v1/notes/document-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Document does not exists.");
    });

    it("should return 404 when no notes were deleted", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockDocumentsFindFirst.mockResolvedValue({ id: "document-id-123" });
        mockNotesDeleteMany.mockResolvedValue({ count: 0 });

        const response = await request(app).delete("/api/v1/notes/document-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Failed to delete notes.");
    });
});
