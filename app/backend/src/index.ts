import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

import app from "./app.js";
import { prisma } from "./db/prisma.js";
import { logger } from "./utils/logger.js";
import { ensureBucket } from "./services/storage.service.js";

const PORT = Number(process.env.PORT) || 4000;

async function startServer() {
    try {
        // Connect to PostgreSQL
        await prisma.$connect();
        await ensureBucket();
        logger.info("Connected to PostgreSQL");

        // Start Express server
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received. Shutting down...`);

            server.close(async () => {
                try {
                    await prisma.$disconnect();
                    logger.info("Disconnected from PostgreSQL");
                    process.exit(0);
                } catch (error) {
                    logger.fatal(error, "Error while disconnecting Prisma");
                    process.exit(1);
                }
            });
        };

        process.on("SIGINT", () => {
            void shutdown("SIGINT");
        });

        process.on("SIGTERM", () => {
            void shutdown("SIGTERM");
        });

        process.on("uncaughtException", (error) => {
            logger.fatal(error, "Uncaught Exception");
            process.exit(1);
        });

        process.on("unhandledRejection", (reason) => {
            logger.fatal(reason, "Unhandled Promise Rejection");
            process.exit(1);
        });
    } catch (error) {
        logger.fatal(error, "Failed to start server");
        process.exit(1);
    }
}

void startServer();