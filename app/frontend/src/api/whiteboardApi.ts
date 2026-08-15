import { apiClient } from './apiClient';
import type { Whiteboard } from '../store/types';

export interface CreateWhiteboardPayload {
  title: string;
  drawingData: any;
  thumbnail?: Blob | File | string;
}

function dataURItoBlob(dataURI: string): Blob {
  try {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch {
    return new Blob([dataURI], { type: 'image/png' });
  }
}

export const whiteboardApi = {
  getAllWhiteboards: () =>
    apiClient.get<Whiteboard[]>('/whiteboard'),

  createWhiteboard: (data: CreateWhiteboardPayload) => {
    const formData = new FormData();
    formData.append('title', data.title);

    // Format drawingData into a valid JSON string
    let jsonString: string;
    if (typeof data.drawingData === 'string') {
      if (data.drawingData.startsWith('{') || data.drawingData.startsWith('[')) {
        jsonString = data.drawingData;
      } else {
        jsonString = JSON.stringify({ image: data.drawingData });
      }
    } else {
      jsonString = JSON.stringify(data.drawingData);
    }
    formData.append('drawingData', jsonString);

    if (data.thumbnail) {
      if (typeof data.thumbnail === 'string') {
        const blob = dataURItoBlob(data.thumbnail);
        formData.append('thumbnail', blob, 'thumbnail.png');
      } else {
        formData.append('thumbnail', data.thumbnail, 'thumbnail.png');
      }
    }

    return apiClient.post<Whiteboard>('/whiteboard', formData, { isFormData: true });
  },

  getWhiteboardById: (whiteboardId: string) =>
    apiClient.get<Whiteboard>(`/whiteboard/${whiteboardId}`),

  deleteWhiteboard: (whiteboardId: string) =>
    apiClient.delete<{ message: string }>(`/whiteboard/${whiteboardId}`),

  deleteAllWhiteboards: () =>
    apiClient.delete<{ message: string }>('/whiteboard'),
};
