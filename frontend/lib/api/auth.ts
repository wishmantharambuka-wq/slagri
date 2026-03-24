// Auth API endpoints
import { apiClient } from './client';
import { User, AuthResponse } from '@/lib/types/auth';
import { TOKEN_KEY, USER_KEY } from '@/lib/constants/config';

export const authApi = {
  login: async (credentials: {
    username?: string;
    password?: string;
    role?: string;
    name?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    // Store token and user
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
    return response;
  },

  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    district?: string;
    province?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
    return response;
  },

  getMe: async (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },
};
