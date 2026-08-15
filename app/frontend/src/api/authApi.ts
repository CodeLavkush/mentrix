import { apiClient } from './apiClient';
import type { User, AcademicDetails } from '../store/types';

export interface LoginPayload {
  email?: string;
  username?: string;
  password?: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password?: string;
  gender?: string;
  age?: number;
  avatar?: File;
}

export interface AuthResponseData {
  user: User;
  academicDetails?: AcademicDetails | null;
  accessToken?: string;
  refreshToken?: string;
}

export const authApi = {
  login: (data: LoginPayload) =>
    apiClient.post<AuthResponseData>('/auth/login', data),

  register: (data: FormData | RegisterPayload) => {
    if (data instanceof FormData) {
      return apiClient.post<AuthResponseData>('/auth/register', data, { isFormData: true });
    }
    return apiClient.post<AuthResponseData>('/auth/register', data);
  },

  logout: () =>
    apiClient.post<{ message: string }>('/auth/logout'),

  getCurrentUser: () =>
    apiClient.post<AuthResponseData>('/auth/current-user'),

  refreshToken: (refreshToken?: string) =>
    apiClient.post<{ accessToken: string; refreshToken?: string }>('/auth/refresh-token', { refreshToken }),

  verifyEmail: (otp: string, email: string) =>
    apiClient.post<{ message: string }>('/auth/verify-email', { otp, email }),

  resendEmailVerification: (email: string) =>
    apiClient.post<{ message: string }>('/auth/resend-email-verification', { email }),
};
