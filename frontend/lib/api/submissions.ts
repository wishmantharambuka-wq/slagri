// Submissions API endpoints
import { apiClient } from './client';
import { Submission } from '@/lib/types/api';

export const submissionsApi = {
  list: async (params?: { district?: string; crop?: string; status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.district) query.set('district', params.district);
    if (params?.crop) query.set('crop', params.crop);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<Submission[]>(`/submissions${qs}`);
  },

  getById: async (id: string) => {
    return apiClient.get<Submission>(`/submissions/${id}`);
  },

  create: async (data: Partial<Submission>) => {
    return apiClient.post<Submission>('/submissions', data);
  },

  updateStatus: async (id: string, status: string) => {
    return apiClient.put<Submission>(`/submissions/${id}/status`, { status });
  },

  remove: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/submissions/${id}`);
  },
};
