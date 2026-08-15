export const Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const UploadStatus = {
  UPLOADING: 'UPLOADING',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  FAILED: 'FAILED',
} as const;
export type UploadStatus = (typeof UploadStatus)[keyof typeof UploadStatus];

export const Difficulty = {
  EASY: 'EASY',
  MEDIUM: 'MEDIUM',
  HARD: 'HARD',
} as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const Sender = {
  AI: 'AI',
  USER: 'USER',
} as const;
export type Sender = (typeof Sender)[keyof typeof Sender];

export interface User {
  id: string;
  username: string;
  email: string;
  gender?: Gender | null;
  age?: number | null;
  avatarKey?: string | null;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AcademicDetails {
  id: string;
  userId: string;
  collegeName?: string | null;
  universityName?: string | null;
  course?: string | null;
  branch?: string | null;
  year?: number | null;
  semester?: number | null;
  rollNumber?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  uploadStatus: UploadStatus;
  createdAt?: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation?: string | null;
}

export interface Quiz {
  id: string;
  userId: string;
  documentId: string;
  quizTitle: string;
  difficulty: Difficulty;
  totalQuestions: number;
  createdAt?: string;
  quizQuestions?: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  attemptedAt?: string;
  quiz?: Quiz;
}

export interface Note {
  id: string;
  userId: string;
  documentId: string;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Whiteboard {
  id: string;
  userId: string;
  title: string;
  drawingData: Record<string, unknown> | unknown[];
  thumbnail?: string | null;
  thumbnailUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  userId?: string;
  documentId?: string;
  sender?: Sender | string;
  message: string;
  timestamp?: string;
}

export interface Flashcard {
  id: string;
  flashcardSetId: string;
  frontText: string;
  backText: string;
  difficulty: Difficulty;
  createdAt?: string;
}

export interface FlashcardSet {
  id: string;
  userId: string;
  quizAttemptId: string;
  title: string;
  topic: string;
  totalCards: number;
  createdAt?: string;
  updatedAt?: string;
  flashcards?: Flashcard[];
}

export interface FlashcardProgress {
  id: string;
  userId: string;
  flashcardId: string;
  reviewCount: number;
  correctCount: number;
  lastReviewed?: string | null;
  masteryLevel: number;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
