import { jest } from "@jest/globals";
import type { Mock } from "node:test";

export const mockUploadFile: Mock<any> = jest.fn<
    (
        key: string,
        buffer: Buffer,
        mimetype: string
    ) => Promise<void>
>();


export const mockGetFileUrl: Mock<any> = jest.fn<
    (key: string) => Promise<string>
>();

export const mockGetFileMetadata: Mock<any> = jest.fn();

export const mockDeleteFile: Mock<any> = jest.fn();

export const mockFileExists: Mock<any> = jest.fn();

export const mockGetFileStream: Mock<any> = jest.fn();

export function setupStorageMock() {
    jest.unstable_mockModule(
        "../../services/storage.service.js",
        () => ({
            uploadFile: mockUploadFile,
            getFileUrl: mockGetFileUrl,
            getFileMetadata: mockGetFileMetadata,
            deleteFile: mockDeleteFile,
            fileExists: mockFileExists,
            getFileStream: mockGetFileStream,
        })
    );
}