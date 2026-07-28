import { Worker } from "bullmq";
import { prisma } from "../db/prisma.js";
import { redisClient } from "../db/redis.js";
import type { DocumentProcessingJob } from "../queues/document.queue.js";
import { logger } from "../utils/logger.js";

export const documentWorker = new Worker<DocumentProcessingJob>(
    "document-processing",
    async (job) => {
        const { documentId, userId, storagePath } = job.data;

        try {
            const response = await fetch(
                `${process.env.AI_SERVICE_URL}/internal/process-document`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        documentId,
                        userId,
                        storagePath,
                    }),
                    signal: AbortSignal.timeout(10 * 60 * 1000), // 10 minutes
                }
            );

            if (!response.ok) {
                throw new Error(`Python service returned ${response.status}`);
            }

            await prisma.documents.update({
                where: {
                    id: documentId,
                },
                data: {
                    uploadStatus: "READY",
                },
            });
        } catch (error) {
            await prisma.documents.update({
                where: {
                    id: documentId,
                },
                data: {
                    uploadStatus: "FAILED",
                },
            });

            throw error;
        }
    },
    {
        connection: redisClient,
        concurrency: 2,
    }
);

documentWorker.on("completed", (job) => {
    logger.info(`Job ${job.id} completed`);
});

documentWorker.on("failed", (job, err) => {
    logger.error(`Job ${job?.id} failed`);
    logger.error(err.message);
});

documentWorker.on("error", (err) => {
    logger.error(err);
});