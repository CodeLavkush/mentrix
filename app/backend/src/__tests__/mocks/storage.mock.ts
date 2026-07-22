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

export function setupStorageMock() {
    jest.unstable_mockModule(
        "../../services/storage.service.js",
        () => ({
            uploadFile: mockUploadFile,
            getFileUrl: mockGetFileUrl,
        })
    );
}