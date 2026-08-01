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

export async function fileExists(storagePath: string) {
    try {
        await minioClient.statObject(
            BUCKET_NAME,
            storagePath,
        );

        return true;
    } catch {
        return false;
    }
}

export async function deleteFile(storagePath: string) {
    await minioClient.removeObject(
        BUCKET_NAME,
        storagePath,
    );
}

export async function getFileStream(
    storagePath: string,
) {
    return await minioClient.getObject(
        BUCKET_NAME,
        storagePath,
    );
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

export async function getFileMetadata(fileName: string) {
    return await minioClient.statObject(
        BUCKET_NAME,
        fileName,
    );
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