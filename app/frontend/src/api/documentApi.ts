import { apiClient } from './apiClient';
import type { DocumentItem } from '../store/types';

export const documentApi = {
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    return apiClient.post<DocumentItem>('/document', formData, { isFormData: true });
  },

  getDocuments: () =>
    apiClient.get<DocumentItem[]>('/document'),

  deleteDocument: (documentId: string) =>
    apiClient.delete<{ message: string }>(`/document/${documentId}`),

  getDownloadUrl: (documentId: string) =>
    `/api/v1/document/${documentId}/download`,
};
