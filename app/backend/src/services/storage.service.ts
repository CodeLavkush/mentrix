import { minioClient } from "../db/minio.js";
import dotenv from "dotenv";

dotenv.config();

const BUCKET_NAME = process.env.MINIO_BUCKET!;

export async function ensureBucket() {
    const exists = await minioClient.bucketExists(BUCKET_NAME);

    if (!exists) {
        await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    }
}

export async function uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string,
) {
    await minioClient.putObject(
        BUCKET_NAME,
        fileName,
        fileBuffer,
        fileBuffer.length,
        {
            "Content-Type": mimeType,
        },
    );

    return fileName;
}

export async function getFileUrl(
    fileName: string,
    expiry = 60 * 60,
) {
    return await minioClient.presignedGetObject(
        BUCKET_NAME,
        fileName,
        expiry,
    );
}