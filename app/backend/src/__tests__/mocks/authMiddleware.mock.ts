import { jest } from "@jest/globals";

export function setupAuthMiddlwareMock() {
    jest.unstable_mockModule(
        "../../middlewares/auth.middleware.js",
        () => ({
            verifyJWT: (
                req: any,
                _res: any,
                next: any
            ) => {
                req.user = {
                    id: "user-id-123",
                };

                next();
            },
        })
    );
}