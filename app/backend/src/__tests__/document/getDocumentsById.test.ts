import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockDocumentsFindMany,

    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

// Register mocks
setupPrismaMock();
setupAuthMiddlwareMock();

// Import app after mocks
const { default: app } = await import("../../app.js");

describe("GET /api/v1/document", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch all documents successfully", async () => {
        // Arrange
        mockFindFirst.mockResolvedValue({
            id: "user-id-123",
        });

        mockDocumentsFindMany.mockResolvedValue([
            {
                id: "document-1",
                fileName: "notes.pdf",
                fileType: "application/pdf",
                fileSize: 2048,
                uploadStatus: "READY",
                user: {
                    id: "user-id-123",
                    username: "john",
                },
            },
            {
                id: "document-2",
                fileName: "resume.pdf",
                fileType: "application/pdf",
                fileSize: 1024,
                uploadStatus: "PROCESSING",
                user: {
                    id: "user-id-123",
                    username: "john",
                },
            },
        ]);

        // Act
        const response = await request(app).get("/api/v1/document");

        // Assert
        expect(response.status).toBe(200);

        expect(response.body.message).toBe(
            "Documents fetched Successfully"
        );

        expect(response.body.data).toEqual([
            {
                id: "document-1",
                fileName: "notes.pdf",
                fileType: "application/pdf",
                fileSize: 2048,
                uploadStatus: "READY",
                user: {
                    id: "user-id-123",
                    username: "john",
                },
            },
            {
                id: "document-2",
                fileName: "resume.pdf",
                fileType: "application/pdf",
                fileSize: 1024,
                uploadStatus: "PROCESSING",
                user: {
                    id: "user-id-123",
                    username: "john",
                },
            },
        ]);

        expect(mockFindFirst).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    id: "user-id-123",
                },
            })
        );

        expect(mockDocumentsFindMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: {
                    userId: "user-id-123",
                },
            })
        );
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/document");

        expect(response.status).toBe(404);

        expect(response.body.message).toBe(
            "User does not exists"
        );

        expect(mockDocumentsFindMany).not.toHaveBeenCalled();
    });

    it("should return 404 when user has no documents", async () => {
        mockFindFirst.mockResolvedValue({
            id: "user-id-123",
        });

        mockDocumentsFindMany.mockResolvedValue([]);

        const response = await request(app).get("/api/v1/document");

        expect(response.status).toBe(404);

        expect(response.body.message).toBe(
            "No documents found for the user"
        );
    });
});