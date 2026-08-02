import request from "supertest";
import { PassThrough } from "stream";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,

    mockGetFileMetadata,
    mockGetFileStream,

    setupPrismaMock,
    setupStorageMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

// Register mocks
setupPrismaMock();
setupStorageMock();
setupAuthMiddlwareMock();

// Import app after mocks
const { default: app } = await import("../../app.js");

describe("GET /api/v1/document/:documentId/download", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should download document successfully", async () => {
        // Arrange
        mockFindFirst.mockResolvedValue({
            id: "user-id-123",
        });

        mockDocumentsFindFirst.mockResolvedValue({
            id: "document-id-123",
            fileName: "notes.pdf",
            storagePath: "users/documents/user-id-123/notes.pdf",
        });

        mockGetFileMetadata.mockResolvedValue({
            metaData: {
                "content-type": "application/pdf",
            },
        });

        const stream = new PassThrough();
        stream.end(Buffer.from("dummy pdf"));

        mockGetFileStream.mockResolvedValue(stream);

        // Act
        const response = await request(app).get(
            "/api/v1/document/document-id-123/download"
        );

        // Assert
        expect(response.status).toBe(200);

        expect(response.headers["content-type"]).toContain(
            "application/pdf"
        );

        expect(response.headers["content-disposition"]).toBe(
            'attachment; filename="notes.pdf"'
        );

        expect(mockFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: "user-id-123",
                },
            })
        );

        expect(mockDocumentsFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: "document-id-123",
                    userId: "user-id-123",
                },
            })
        );

        expect(mockGetFileMetadata).toHaveBeenCalledWith(
            "users/documents/user-id-123/notes.pdf"
        );

        expect(mockGetFileStream).toHaveBeenCalledWith(
            "users/documents/user-id-123/notes.pdf"
        );
    });

    it("should return 404 if user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).get(
            "/api/v1/document/document-id-123/download"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists");
    });

    it("should return 404 if document does not exist", async () => {
        mockFindFirst.mockResolvedValue({
            id: "user-id-123",
        });

        mockDocumentsFindFirst.mockResolvedValue(null);

        const response = await request(app).get(
            "/api/v1/document/document-id-123/download"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Document does not exists");
    });
});