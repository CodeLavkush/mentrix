import { apiClient } from './apiClient';
import type { Note } from '../store/types';

export interface CreateNotePayload {
  title: string;
  content: string;
}

export const notesApi = {
  getNotesByDocument: (documentId: string) =>
    apiClient.get<Note[]>(`/notes/${documentId}`),

  createNote: (documentId: string, data: CreateNotePayload) =>
    apiClient.post<Note>(`/notes/${documentId}`, data),

  getNoteById: (documentId: string, noteId: string) =>
    apiClient.get<Note>(`/notes/${documentId}/${noteId}`),

  deleteNote: (documentId: string, noteId: string) =>
    apiClient.delete<{ message: string }>(`/notes/${documentId}/${noteId}`),

  deleteAllNotes: (documentId: string) =>
    apiClient.delete<{ message: string }>(`/notes/${documentId}`),
};
