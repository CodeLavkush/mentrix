import { apiClient } from './apiClient';
import type { Quiz, QuizQuestion, QuizAttempt } from '../store/types';

export interface CreateQuizPayload {
  quizTitle: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  totalQuestions?: number;
}

export interface SubmitAttemptPayload {
  score: number;
  totalMarks: number;
  percentage?: number;
  timeTaken: number;
}

export const quizApi = {
  getQuizzesByDocument: (documentId: string) =>
    apiClient.get<Quiz[]>(`/quiz/${documentId}`),

  createQuiz: (documentId: string, data: CreateQuizPayload) =>
    apiClient.post<Quiz>(`/quiz/${documentId}`, data),

  getQuizById: (documentId: string, quizId: string) =>
    apiClient.get<Quiz>(`/quiz/${documentId}/${quizId}`),

  deleteQuiz: (documentId: string, quizId: string) =>
    apiClient.delete<{ message: string }>(`/quiz/${documentId}/${quizId}`),

  getQuizQuestions: (quizId: string) =>
    apiClient.get<QuizQuestion[]>(`/quiz-questions/${quizId}`),

  submitAttempt: (quizId: string, data: SubmitAttemptPayload) =>
    apiClient.post<QuizAttempt>(`/quiz-attempts/${quizId}`, data),

  getAttemptsByQuiz: (quizId: string) =>
    apiClient.get<QuizAttempt[]>(`/quiz-attempts/${quizId}`),
};
