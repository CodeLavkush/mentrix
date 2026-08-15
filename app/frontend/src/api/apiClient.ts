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
      const errorMessage = responseData?.message || response.statusText || 'An API error occurred';
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
    throw new ApiError(error.message || 'Network failure / Server unreachable', 500);
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
