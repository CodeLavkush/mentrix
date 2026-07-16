import pino, { type LoggerOptions } from "pino";

const isDevelopment = process.env.NODE_ENV !== "production";

const options: LoggerOptions = {
    level: process.env.LOG_LEVEL ?? "info",

    redact: {
        paths: [
            "password",
            "refreshToken",
            "authorization",
            "req.headers.authorization",
            "req.body.password",
            "req.body.refreshToken",
        ],
        censor: "[REDACTED]",
    },
};

if (isDevelopment) {
    options.transport = {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
            singleLine: false,
        },
    };
}

export const logger = pino(options);