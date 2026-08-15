import request from "supertest";
import { jest } from "@jest/globals";

import {
    mockFindFirst,
    mockWhiteboardsDeleteMany,
    setupPrismaMock,
    setupAuthMiddlwareMock,
} from "../mocks/index.js";

setupPrismaMock();
setupAuthMiddlwareMock();

const { default: app } = await import("../../app.js");

describe("DELETE /api/v1/whiteboard", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should delete all whiteboards for the user successfully", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });

        mockWhiteboardsDeleteMany.mockResolvedValue({
            count: 2,
        });

        const response = await request(app).delete("/api/v1/whiteboard");

        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Whiteboards deleted successfully.");
        expect(response.body.data).toEqual({
            count: 2,
        });

        expect(mockWhiteboardsDeleteMany).toHaveBeenCalledWith({
            where: {
                userId: "user-id-123",
            },
        });
    });

    it("should return 404 when user does not exist", async () => {
        mockFindFirst.mockResolvedValue(null);

        const response = await request(app).delete("/api/v1/whiteboard");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("User does not exists.");
    });

    it("should return 404 when no whiteboards were deleted", async () => {
        mockFindFirst.mockResolvedValue({ id: "user-id-123" });
        mockWhiteboardsDeleteMany.mockResolvedValue({ count: 0 });

        const response = await request(app).delete("/api/v1/whiteboard");

        expect(response.status).toBe(404);
        expect(response.body.message).toBe("Whiteboards failed to delete.");
    });
});
