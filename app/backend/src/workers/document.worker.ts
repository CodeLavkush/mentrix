import { Worker } from "bullmq";
import { prisma } from "../db/prisma.js";
import { redisClient } from "../db/redis.js";
import type { DocumentProcessingJob } from "../queues/document.queue.js";
import { logger } from "../utils/logger.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

if (!AI_SERVICE_URL) {
    throw new Error("AI_SERVICE_URL is not defined");
}

export const documentWorker = new Worker<DocumentProcessingJob>(
    "document-processing",
    async (job) => {
        const { documentId, storagePath } = job.data;

        logger.info(`Processing document: ${documentId}`);

        const response = await fetch(
            `${AI_SERVICE_URL}/api/v1/internal/process-document`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    document_id: documentId,
                    storage_path: storagePath,
                }),
                signal: AbortSignal.timeout(10 * 60 * 1000), // 10 minutes
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                `AI Service Error (${response.status}): ${errorText}`
            );
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message ?? "Document processing failed.");
        }

        logger.info(
            `Document ${documentId} processed successfully (${result.chunks} chunks)`
        );

        return result;
    },
    {
        connection: redisClient,
        concurrency: 2,
    }
);

documentWorker.on("completed", async (job, result) => {
    try {
        await prisma.documents.update({
            where: {
                id: job.data.documentId,
            },
            data: {
                uploadStatus: "READY",
            },
        });

        logger.info(
            `Job ${job.id} completed for document ${job.data.documentId}`
        );

        logger.info(
            `Generated ${result?.chunks ?? 0} chunks`
        );
    } catch (error) {
        logger.error("Failed to update document status to READY");
        logger.error(error);
    }
});

documentWorker.on("failed", async (job, err) => {
    if (!job) {
        logger.error("Job failed before initialization");
        logger.error(err);
        return;
    }

    try {
        await prisma.documents.update({
            where: {
                id: job.data.documentId,
            },
            data: {
                uploadStatus: "FAILED",
            },
        });

        logger.error(
            `Job ${job.id} failed for document ${job.data.documentId}`
        );
        logger.error(err.message);
    } catch (error) {
        logger.error("Failed to update document status to FAILED");
        logger.error(error);
    }
});

documentWorker.on("error", (err) => {
    logger.error("BullMQ Worker Error");
    logger.error(err);
});