import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsCreate,
    setupPrismaMock,

    mockUploadFile,
    mockGetFileMetadata,
    setupStorageMock,

    mockQueueAdd,
    setupQueueMock,

    setupAuthMiddlwareMock,
} from "../mocks/index.js";

// Register mocks
setupPrismaMock();
setupStorageMock();
setupQueueMock();
setupAuthMiddlwareMock();

// Import app after mocks
const { default: app } = await import("../../app.js");

describe("POST /api/v1/document", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should upload document successfully", async () => {
        // Arrange
        mockFindFirst.mockResolvedValue({
            id: "user-id-123",
        });

        mockUploadFile.mockResolvedValue(
            "users/documents/user-id-123/document.pdf"
        );

        mockGetFileMetadata.mockResolvedValue({
            size: 2048,
        });

        mockDocumentsCreate.mockResolvedValue({
            id: "document-id-123",
            fileName: "document.pdf",
            fileType: "application/pdf",
            fileSize: 2048,
            uploadStatus: "PROCESSING",
            user: {
                id: "user-id-123",
                username: "john",
            },
        });

        mockQueueAdd.mockResolvedValue(undefined);

        // Act
        const response = await request(app)
            .post("/api/v1/document")
            .attach(
                "document",
                Buffer.from("Dummy PDF Content"),
                "document.pdf"
            );

        // Assert
        expect(response.status).toBe(201);

        expect(response.body.message).toBe(
            "Document uploaded Successfully"
        );

        expect(response.body.data).toEqual({
            id: "document-id-123",
            fileName: "document.pdf",
            fileType: "application/pdf",
            fileSize: 2048,
            uploadStatus: "PROCESSING",
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

        expect(mockUploadFile).toHaveBeenCalled();

        expect(mockGetFileMetadata).toHaveBeenCalledWith(
            "users/documents/user-id-123/document.pdf"
        );

        expect(mockDocumentsCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: "user-id-123",
                    fileName: "document.pdf",
                    fileType: "application/pdf",
                    fileSize: 2048,
                    storagePath:
                        "users/documents/user-id-123/document.pdf",
                    uploadStatus: "PROCESSING",
                }),
            })
        );

        expect(mockQueueAdd).toHaveBeenCalledWith(
            "process-document",
            {
                documentId: "document-id-123",
                userId: "user-id-123",
                storagePath:
                    "users/documents/user-id-123/document.pdf",
            },
            expect.objectContaining({
                attempts: 3,
            })
        );
    });
});