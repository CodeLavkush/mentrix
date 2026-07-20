import request from "supertest";
import app from "../app.js";

describe("GET /api/v1/healthcheck", () => {
    it("should return a successful health check", async () => {
        const response = await request(app)
            .get("/api/v1/healthcheck");

        expect(response.status).toBe(200);

        expect(response.body).toEqual({
            data: {
                "message": "Server is running"
            },
            message: "Success",
            statusCode: 200,
            success: true
        });
    });
});