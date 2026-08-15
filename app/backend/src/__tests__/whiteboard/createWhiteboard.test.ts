import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockWhiteboardsCreate,
    mockUploadFile,
    setupPrismaMock,
    setupStorageMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupStorageMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("POST /api/v1/whiteboard", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a whiteboard without thumbnail successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });

        mockWhiteboardsCreate.mockResolvedValue({
            id: "whiteboard-id-123",
            title: "Architecture Diagram",
            drawingData: { shapes: [] },
            thumbnail: null,
            user: {
                id: "user-id-123",
                username: "testuser",
            },
            createdAt: "2026-08-15T00:00:00.000Z",
            updatedAt: "2026-08-15T00:00:00.000Z",
        });

        const response = await request(app)
            .post("/api/v1/whiteboard")
            .field("title", "Architecture Diagram")
            .field("drawingData", JSON.stringify({ shapes: [] }));

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Whiteboard created successfully.");
        expect(response.body.data).toEqual({
            id: "whiteboard-id-123",
            title: "Architecture Diagram",
            drawingData: { shapes: [] },
            thumbnail: null,
            user: {
                id: "user-id-123",
                username: "testuser",
            },
            createdAt: "2026-08-15T00:00:00.000Z",
            updatedAt: "2026-08-15T00:00:00.000Z",
        });
    });

    it("should create a whiteboard with thumbnail image attached", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockUploadFile.mockResolvedValue("users/whiteboard/user-id-123/thumbnail.png");

        mockWhiteboardsCreate.mockResolvedValue({
            id: "whiteboard-id-123",
            title: "Architecture Diagram",
            drawingData: { shapes: [] },
            thumbnail: expect.any(String),
            user: {
                id: "user-id-123",
                username: "testuser",
            },
            createdAt: "2026-08-15T00:00:00.000Z",
            updatedAt: "2026-08-15T00:00:00.000Z",
        });

        const response = await request(app)
            .post("/api/v1/whiteboard")
            .field("title", "Architecture Diagram")
            .field("drawingData", JSON.stringify({ shapes: [] }))
            .attach("thumbnail", Buffer.from("fake-image"), "thumb.png");

        expect(response.status).toBe(201);
        expect(response.body.message).toBe("Whiteboard created successfully.");
        expect(mockUploadFile).toHaveBeenCalled();
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app)
            .post("/api/v1/whiteboard")
            .field("title", "Architecture Diagram")
            .field("drawingData", JSON.stringify({ shapes: [] }));

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });
});
