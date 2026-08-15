import { apiClient } from './apiClient';
import type { ChatMessage } from '../store/types';

export interface SendMessagePayload {
  message: string;
}

export interface GetMessagesResponse {
  messages: ChatMessage[];
  document?: {
    id: string;
    [key: string]: any;
  };
}

export const chatApi = {
  getMessages: (documentId: string) =>
    apiClient.get<GetMessagesResponse>(`/chat/${documentId}`),

  sendMessage: (documentId: string, message: string) =>
    apiClient.post<ChatMessage>(`/chat/${documentId}`, { message }),
};
