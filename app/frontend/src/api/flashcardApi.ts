import { apiClient } from './apiClient';
import type { FlashcardSet, Flashcard, FlashcardProgress } from '../store/types';

export interface CreateFlashcardSetPayload {
  title: string;
  topic: string;
  totalCards?: number;
}

export const flashcardApi = {
  getSetsByQuizAttempt: (quizAttemptId: string) =>
    apiClient.get<FlashcardSet[]>(`/flashcardsets/${quizAttemptId}`),

  createFlashcardSet: (quizAttemptId: string, data: CreateFlashcardSetPayload) =>
    apiClient.post<FlashcardSet>(`/flashcardsets/${quizAttemptId}`, data),

  getSetById: (quizAttemptId: string, flashcardSetsId: string) =>
    apiClient.get<FlashcardSet>(`/flashcardsets/${quizAttemptId}/${flashcardSetsId}`),

  deleteSet: (quizAttemptId: string, flashcardSetsId: string) =>
    apiClient.delete<{ message: string }>(`/flashcardsets/${quizAttemptId}/${flashcardSetsId}`),

  getCardsBySet: (flashcardSetId: string) =>
    apiClient.get<Flashcard[]>(`/flashcards/${flashcardSetId}`),

  updateProgress: (flashcardId: string, isCorrect: boolean) =>
    apiClient.post<FlashcardProgress>(`/flashcard-progress/${flashcardId}`, { isCorrect }),
};
