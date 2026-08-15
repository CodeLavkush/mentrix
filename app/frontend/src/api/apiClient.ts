import type { ApiResponse } from '../store/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

interface RequestOptions extends RequestInit {
  bodyData?: any;
  isFormData?: boolean;
}

export async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { bodyData, isFormData = false, headers: customHeaders, ...customOptions } = options;

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Retrieve token from local storage if available
  const token = localStorage.getItem('mentrix_auth_token');

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  const isForm = isFormData || (typeof FormData !== 'undefined' && bodyData instanceof FormData);

  if (!isForm && bodyData) {
    headers['Content-Type'] = 'application/json';
  } else if (isForm) {
    delete headers['Content-Type'];
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customOptions,
    headers,
    credentials: 'include', // send cookies for refresh-token if backend uses cookies
  };

  if (bodyData) {
    config.body = isForm ? bodyData : JSON.stringify(bodyData);
  }

  try {
    const response = await fetch(url, config);
    let responseData: any;

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = { message: text };
    }

    if (!response.ok) {
      let errorMessage = responseData?.message || response.statusText || 'An API error occurred';

      // Parse field-level validation errors from express-validator or custom ApiError
      const rawErrors = responseData?.errors || responseData?.extractedErrors || (Array.isArray(responseData?.data) ? responseData.data : null);
      if (rawErrors && Array.isArray(rawErrors) && rawErrors.length > 0) {
        const errorDetails = rawErrors
          .map((errItem: any) => {
            if (typeof errItem === 'string') return errItem;
            if (typeof errItem === 'object' && errItem !== null) {
              if (errItem.msg) return errItem.msg;
              if (errItem.message) return errItem.message;
              const values = Object.values(errItem);
              if (values.length > 0) return values.join(', ');
            }
            return String(errItem);
          })
          .filter(Boolean);

        if (errorDetails.length > 0) {
          errorMessage = errorDetails.join('. ');
        }
      }

      // Humanize standard backend error messages
      if (errorMessage === 'User already exists') {
        errorMessage = 'An account with this email or username already exists. Please sign in instead.';
      } else if (errorMessage === 'User does not exists' || errorMessage === 'User does not exist') {
        errorMessage = 'No account found with these details. Please register or check your credentials.';
      } else if (errorMessage === 'Invalid password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (errorMessage === 'Invalid OTP') {
        errorMessage = 'The 6-digit OTP code entered is incorrect. Please check your inbox and try again.';
      } else if (errorMessage === 'OTP is expired or not found') {
        errorMessage = 'The OTP code has expired or is invalid. Please request a new code.';
      } else if (errorMessage === 'Email is already verified') {
        errorMessage = 'This email is already verified. You can log in directly.';
      } else if (response.status === 413) {
        errorMessage = 'The uploaded file is too large. Please select a smaller file (under 16MB).';
      }

      throw new ApiError(errorMessage, response.status, responseData);
    }

    // Format response to standard ApiResponse
    if (responseData && typeof responseData === 'object' && 'statusCode' in responseData) {
      return responseData as ApiResponse<T>;
    }

    return {
      statusCode: response.status,
      data: responseData?.data !== undefined ? responseData.data : responseData,
      message: responseData?.message || 'Success',
      success: true,
    };
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    const isNetworkError = error?.message?.toLowerCase().includes('failed to fetch') || error?.name === 'TypeError';
    const friendlyMsg = isNetworkError
      ? 'Unable to connect to the Mentrix server. Please check your network connection.'
      : (error.message || 'An unexpected error occurred. Please try again.');
    throw new ApiError(friendlyMsg, 500);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T>(endpoint: string, bodyData?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', bodyData }),
  put: <T>(endpoint: string, bodyData?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', bodyData }),
  patch: <T>(endpoint: string, bodyData?: any, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', bodyData }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
