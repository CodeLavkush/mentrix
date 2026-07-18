import type { Request, Response, NextFunction } from "express";
import {
    validationResult,
    type FieldValidationError,
} from "express-validator";

import { ApiError } from "../utils/api-error.js";

export const validate = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const extractedErrors = errors
        .array()
        .filter((err): err is FieldValidationError => err.type === "field")
        .map((err) => ({
            [err.path]: err.msg,
        }));

    throw new ApiError(
        422,
        "Received data is not valid",
        extractedErrors
    );
};