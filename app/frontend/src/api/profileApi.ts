import { apiClient } from './apiClient';
import type { AcademicDetails } from '../store/types';

export interface AcademicDetailsPayload {
  collegeName?: string;
  universityName?: string;
  course?: string;
  branch?: string;
  year?: number;
  semester?: number;
  rollNumber?: number;
}

export const profileApi = {
  getProfile: () =>
    apiClient.get<AcademicDetails>('/profile/academics'),

  createProfile: (data: AcademicDetailsPayload) =>
    apiClient.post<AcademicDetails>('/profile/academics', data),

  updateProfile: (data: AcademicDetailsPayload) =>
    apiClient.patch<AcademicDetails>('/profile/academics', data),
};
