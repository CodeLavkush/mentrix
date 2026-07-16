import { randomUUID } from "node:crypto";
import { pinoHttp } from "pino-http";
import { logger } from "../utils/logger.js";

export const httpLogger = pinoHttp({
    logger,

    autoLogging: true,

    genReqId(req) {
        return req.headers["x-request-id"]?.toString() ?? randomUUID();
    },

    customLogLevel(req, res, err) {
        if (err || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
    },

    customSuccessMessage(req, res) {
        return `${req.method} ${req.url} completed with ${res.statusCode}`;
    },

    customErrorMessage(req, res) {
        return `${req.method} ${req.url} failed with ${res.statusCode}`;
    },
});