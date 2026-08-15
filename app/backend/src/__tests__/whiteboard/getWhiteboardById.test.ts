import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockWhiteboardsFindFirst,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("GET /api/v1/whiteboard/:whiteboardId", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch whiteboard by ID successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });

        mockWhiteboardsFindFirst.mockResolvedValue({
            id: "wb-id-123",
            title: "Database Schema",
            drawingData: { tables: [] },
            thumbnail: "thumb.png",
            user: {
                id: "user-id-123",
                username: "testuser",
            },
            createdAt: "2026-08-15T00:00:00.000Z",
            updatedAt: "2026-08-15T00:00:00.000Z",
        });

        const response = await request(app).get("/api/v1/whiteboard/wb-id-123");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Whiteboard fetched successfully.");
        expect(response.body.data).toEqual({
            id: "wb-id-123",
            title: "Database Schema",
            drawingData: { tables: [] },
            thumbnail: "thumb.png",
            user: {
                id: "user-id-123",
                username: "testuser",
            },
            createdAt: "2026-08-15T00:00:00.000Z",
            updatedAt: "2026-08-15T00:00:00.000Z",
        });

        expect(mockWhiteboardsFindFirst).toHaveBeenCalledWith({
            where: {
                id: "wb-id-123",
                userId: "user-id-123",
            },
            select: {
                id: true,
                title: true,
                drawingData: true,
                thumbnail: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/whiteboard/wb-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when whiteboard is not found", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockWhiteboardsFindFirst.mockResolvedValue(null);

        const response = await request(app).get("/api/v1/whiteboard/wb-id-123");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Whiteboard failed to fetched.");
    });
});
