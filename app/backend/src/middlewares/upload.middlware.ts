import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "image/gif",

    // PDF
    "application/pdf",

    // Microsoft Word
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx

    // Microsoft PowerPoint
    "application/vnd.ms-powerpoint", // .ppt
    "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx

    // Microsoft Excel
    "application/vnd.ms-excel", // .xls
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx

    // Text
    "text/plain",
    "text/markdown",

    // CSV
    "text/csv",

    // JSON
    "application/json",
];

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Unsupported file type: ${file.mimetype}`
            )
        );
    }
};

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },
    fileFilter,
});