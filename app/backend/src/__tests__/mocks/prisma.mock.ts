import { jest } from "@jest/globals";
import type { MockCreatedUser, MockCreatedUserWithoutAvatar } from "../../types/test/index.js";
import type { Mock } from "node:test";

//User
export const mockFindFirst: Mock<any> = jest.fn<
    (args: unknown) => Promise<{ id: string } | null>
>();

export const mockCreate: Mock<any> = jest.fn<
    (args: unknown) => Promise<MockCreatedUser>
>();

export const mockFindUnique: Mock<any> = jest.fn<
    (args: unknown) => Promise<
        MockCreatedUserWithoutAvatar | null
    >
>();

export const mockUpdate: Mock<any> = jest.fn();


// Academic Details
export const mockAcademicDetailsFindFirst:
    Mock<any> = jest.fn();

export const mockAcademicDetailsCreate:
    Mock<any> = jest.fn();

export const mockAcademicDetailsUpdate: Mock<any> = jest.fn<
    (args: unknown) => Promise<{ id: string } | null>
>();

// Documents
export const mockDocumentsCreate: Mock<any> = jest.fn();
export const mockDocumentsFindMany: Mock<any> = jest.fn();
export const mockDocumentsFindFirst: Mock<any> = jest.fn();
export const mockDocumentsDelete: Mock<any> = jest.fn();

//chat
export const mockChatMessagesCreate: Mock<any> = jest.fn();
export const mockChatMessagesFindMany: Mock<any> = jest.fn();

// Quizzes
export const mockQuizzesCreate: Mock<any> = jest.fn();
export const mockQuizzesFindMany: Mock<any> = jest.fn();
export const mockQuizzesFindFirst: Mock<any> = jest.fn();
export const mockQuizzesDelete: Mock<any> = jest.fn();
export const mockQuizzesDeleteMany: Mock<any> = jest.fn();

// Quiz Attempts
export const mockQuizAttemptsCreate: Mock<any> = jest.fn();
export const mockQuizAttemptsFindMany: Mock<any> = jest.fn();
export const mockQuizAttemptsFindFirst: Mock<any> = jest.fn();

// Quiz questions
export const mockQuizQuestionsFindMany: Mock<any> = jest.fn();

// Flashcard sets
export const mockFlashcardSetsFindFirst: Mock<any> = jest.fn();
export const mockFlashcardSetsCreate: Mock<any> = jest.fn();
export const mockFlashcardSetsFindMany: Mock<any> = jest.fn();
export const mockFlashcardSetsDeleteMany: Mock<any> = jest.fn();
export const mockFlashcardSetsDelete: Mock<any> = jest.fn();

//flashcards
export const mockFlashcardsCreate: Mock<any> = jest.fn();
export const mockFlashcardsFindMany: Mock<any> = jest.fn();

export function setupPrismaMock() {
    jest.unstable_mockModule(
        "../../db/prisma.js",
        () => ({
            prisma: {
                user: {
                    findFirst: mockFindFirst,
                    create: mockCreate,
                    findUnique: mockFindUnique,
                    update: mockUpdate,
                },
                academicDetails: {
                    findFirst: mockAcademicDetailsFindFirst,
                    create: mockAcademicDetailsCreate,
                    update: mockAcademicDetailsUpdate,
                },
                documents: {
                    create: mockDocumentsCreate,
                    findMany: mockDocumentsFindMany,
                    findFirst: mockDocumentsFindFirst,
                    delete: mockDocumentsDelete,
                },
                chatMessages: {
                    create: mockChatMessagesCreate,
                    findMany: mockChatMessagesFindMany
                },
                quizzes: {
                    create: mockQuizzesCreate,
                    findMany: mockQuizzesFindMany,
                    findFirst: mockQuizzesFindFirst,
                    delete: mockQuizzesDelete,
                    deleteMany: mockQuizzesDeleteMany,
                },
                quizAttempts: {
                    create: mockQuizAttemptsCreate,
                    findFirst: mockQuizAttemptsFindFirst,
                    findMany: mockQuizAttemptsFindMany,
                },
                quizQuestions: {
                    findMany: mockQuizQuestionsFindMany,
                },
                flashcardSets: {
                    findFirst: mockFlashcardSetsFindFirst,
                    findMany: mockFlashcardSetsFindMany,
                    create: mockFlashcardSetsCreate,
                    deleteMany: mockFlashcardSetsDeleteMany,
                    delete: mockFlashcardSetsDelete,
                },
                flashcards: {
                    create: mockFlashcardsCreate,
                    findMany: mockFlashcardsFindMany,
                },
            },
        })
    );
}