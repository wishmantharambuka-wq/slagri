// Alerts API endpoints
import { apiClient } from './client';
import { Alert } from '@/lib/types/api';

export const alertsApi = {
  list: async (params?: { unread?: boolean; severity?: string }) => {
    const query = new URLSearchParams();
    if (params?.unread) query.set('unread', 'true');
    if (params?.severity) query.set('severity', params.severity);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<Alert[]>(`/alerts${qs}`);
  },

  create: async (data: Partial<Alert>) => {
    return apiClient.post<Alert>('/alerts', data);
  },

  markRead: async (id: string) => {
    return apiClient.put<Alert>(`/alerts/${id}/read`, {});
  },

  markAllRead: async () => {
    return apiClient.put<{ success: boolean }>('/alerts/read-all', {});
  },
};
