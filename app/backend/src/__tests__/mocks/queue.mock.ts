import { jest } from "@jest/globals";
import type { Mock } from "node:test";

export const mockQueueAdd: Mock<any> = jest.fn();

export function setupQueueMock() {
    jest.unstable_mockModule("../../queues/document.queue.js", () => ({
        documentProcessingQueue: {
            add: mockQueueAdd,
        },
    }));
}