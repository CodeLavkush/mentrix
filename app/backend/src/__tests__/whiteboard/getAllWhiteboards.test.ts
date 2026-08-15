import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockWhiteboardsFindMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("GET /api/v1/whiteboard", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should fetch all whiteboards successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });

        mockWhiteboardsFindMany.mockResolvedValue([
            {
                id: "wb-1",
                title: "System Design",
                drawingData: { nodes: [] },
                thumbnail: null,
                user: {
                    id: "user-id-123",
                    username: "testuser",
                },
                createdAt: "2026-08-15T00:00:00.000Z",
                updatedAt: "2026-08-15T00:00:00.000Z",
            },
        ]);

        const response = await request(app).get("/api/v1/whiteboard");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Whiteboards fetched successfully.");
        expect(response.body.data).toEqual([
            {
                id: "wb-1",
                title: "System Design",
                drawingData: { nodes: [] },
                thumbnail: null,
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

        const response = await request(app).get("/api/v1/whiteboard");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when no whiteboards exist", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockWhiteboardsFindMany.mockResolvedValue([]);

        const response = await request(app).get("/api/v1/whiteboard");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Whiteboards failed to fetched.");
    });
});
