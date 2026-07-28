import { Queue } from "bullmq";
import { redisClient } from "../db/redis.js";

export interface DocumentProcessingJob {
    documentId: string;
    userId: string;
    storagePath: string;
}

export const documentProcessingQueue =
    new Queue<DocumentProcessingJob>(
        "document-processing",
        {
            connection: redisClient,
        }
    );