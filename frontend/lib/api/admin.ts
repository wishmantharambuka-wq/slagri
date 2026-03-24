// Admin API endpoints
import { apiClient } from './client';
import { KPIData, Submission, Alert } from '@/lib/types/api';
import { User } from '@/lib/types/auth';

export const adminApi = {
  getStats: async (): Promise<KPIData> => {
    return apiClient.get<KPIData>('/admin/stats');
  },

  getUsers: async (params?: { role?: string; status?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    if (params?.q) query.set('q', params.q);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<User[]>(`/admin/users${qs}`);
  },

  updateUserStatus: async (id: string, status: string) => {
    return apiClient.put<User>(`/admin/users/${id}/status`, { status });
  },

  getSubmissions: async () => {
    return apiClient.get<Submission[]>('/admin/submissions');
  },

  getActivity: async () => {
    return apiClient.get<{ submissions: Submission[]; alerts: Alert[] }>('/admin/activity');
  },
};
