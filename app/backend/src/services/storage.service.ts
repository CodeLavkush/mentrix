import { minioClient } from "../db/minio.js";
import dotenv from "dotenv";

dotenv.config();

const BUCKET_NAME = process.env.MINIO_BUCKET!;

export async function ensureBucket() {
    const exists = await minioClient.bucketExists(BUCKET_NAME);

    if (!exists) {
        await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
    }

    const policy = {
        Version: "2012-10-17",
        Statement: [
            {
                Effect: "Allow",
                Principal: { AWS: ["*"] },
                Action: ["s3:GetObject"],
                Resource: [`arn:aws:s3:::${BUCKET_NAME}/users/avatars/*`]
            }
        ]
    };

    try {
        await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
    } catch (err) {
        console.error("setBucketPolicy error:", err);
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
    try {
        await ensureBucket();
    } catch (err) {
        console.error("ensureBucket error:", err);
    }

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
    expiry = 60 * 60 * 24 * 7,
) {
    // If it's an avatar in the public avatar path, return direct public URL without signature
    if (fileName.startsWith('users/avatars/')) {
        return getPublicAvatarUrl(fileName);
    }

    const rawUrl = await minioClient.presignedGetObject(
        BUCKET_NAME,
        fileName,
        expiry,
    );

    const publicUrl = process.env.MINIO_PUBLIC_URL || "http://localhost:9000";
    const internalHost = process.env.MINIO_ENDPOINT || "minio";
    const internalPort = process.env.MINIO_PORT || "9000";

    return rawUrl
        .replace(new RegExp(`^https?://${internalHost}:${internalPort}`), publicUrl)
        .replace(new RegExp(`^https?://${internalHost}`), publicUrl)
        .replace(new RegExp(`^https?://mentrix-minio:${internalPort}`), publicUrl)
        .replace(new RegExp(`^https?://mentrix-minio`), publicUrl);
}

export function getPublicAvatarUrl(avatarKey?: string | null): string | null {
    if (!avatarKey) return null;
    const publicUrl = process.env.MINIO_PUBLIC_URL || "http://localhost:9000";
    return `${publicUrl}/${BUCKET_NAME}/${avatarKey}`;
}