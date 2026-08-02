import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindFirst,
    mockDocumentsDelete,

    mockFileExists,
    mockDeleteFile,

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

describe("DELETE /api/v1/document/:documentId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete document successfully", async () => {
        // Arrange
        mockFindFirst.mockResolvedValue({
            id: "user-id-123",
        });

        mockDocumentsFindFirst.mockResolvedValue({
            id: "document-id-123",
            storagePath: "users/documents/user-id-123/document.pdf",
        });

        mockFileExists.mockResolvedValue(true);

        mockDeleteFile.mockResolvedValue(undefined);

        mockDocumentsDelete.mockResolvedValue({
            id: "document-id-123",
            fileName: "document.pdf",
            fileType: "application/pdf",
            fileSize: 2048,
            uploadStatus: "READY",
            user: {
                id: "user-id-123",
                username: "john",
            },
        });

        // Act
        const response = await request(app).delete(
            "/api/v1/document/document-id-123"
        );

        // Assert
        expect(response.status).toBe(200);

        expect(response.body.message).toBe(
            "Document deleted Successfully"
        );

        expect(response.body.data).toEqual({
            id: "document-id-123",
            fileName: "document.pdf",
            fileType: "application/pdf",
            fileSize: 2048,
            uploadStatus: "READY",
            user: {
                id: "user-id-123",
                username: "john",
            },
        });

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

        expect(mockFileExists).toHaveBeenCalledWith(
            "users/documents/user-id-123/document.pdf"
        );

        expect(mockDeleteFile).toHaveBeenCalledWith(
            "users/documents/user-id-123/document.pdf"
        );

        expect(mockDocumentsDelete).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: "document-id-123",
                },
            })
        );
    });

    it("should return 404 if user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).delete(
            "/api/v1/document/document-id-123"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists");

        expect(mockDocumentsFindFirst).not.toHaveBeenCalled();
    });

    it("should return 404 if document does not exist", async () => {
        mockFindFirst.mockResolvedValue({
            id: "user-id-123",
        });

        mockDocumentsFindFirst.mockResolvedValue(null);

        const response = await request(app).delete(
            "/api/v1/document/document-id-123"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Document does not exists");

        expect(mockFileExists).not.toHaveBeenCalled();
    });

    it("should return 404 if document is missing in storage", async () => {
        mockFindFirst.mockResolvedValue({
            id: "user-id-123",
        });

        mockDocumentsFindFirst.mockResolvedValue({
            id: "document-id-123",
            storagePath: "users/documents/user-id-123/document.pdf",
        });

        mockFileExists.mockResolvedValue(false);

        const response = await request(app).delete(
            "/api/v1/document/document-id-123"
        );

        expect(response.status).toBe(404);
        expect(response.body.message).toBe(
            "Document does not exists in storage"
        );

        expect(mockDeleteFile).not.toHaveBeenCalled();
        expect(mockDocumentsDelete).not.toHaveBeenCalled();
    });
});