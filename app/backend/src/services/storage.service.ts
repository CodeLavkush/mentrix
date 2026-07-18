import { minioClient } from "../db/minio.js";

const BUCKET_NAME = process.env.MINIO_BUCKET || "mentrix-bucket";

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
        "mentrix-bucket",
        fileName,
        fileBuffer,
        fileBuffer.length,
        {
            "Content-Type": mimeType,
        },
    );

    return fileName;
}