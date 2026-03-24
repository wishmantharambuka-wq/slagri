// Base API client with JWT authentication
import { API_BASE_URL, TOKEN_KEY } from '@/lib/constants/config';

interface FetchOptions extends RequestInit {
  isPublic?: boolean;
}

export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { isPublic = false, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  // Add auth token for protected routes
  if (!isPublic) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  } as RequestInit);

  if (!response.ok) {
    if (response.status === 401) {
      // Clear auth on unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('agriflow_user');
      }
    }
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export const apiClient = {
  get: <T>(endpoint: string, isPublic = false) =>
    fetchApi<T>(endpoint, { method: 'GET', isPublic }),
  post: <T>(endpoint: string, body: unknown, isPublic = false) =>
    fetchApi<T>(endpoint, { method: 'POST', body: JSON.stringify(body), isPublic }),
  put: <T>(endpoint: string, body: unknown) =>
    fetchApi<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, { method: 'DELETE' }),
};
