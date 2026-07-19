import { Redis } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const redisClient = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        tls: process.env.REDIS_URL?.startsWith("rediss://")
            ? {}
            : undefined,
    },
);