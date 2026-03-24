// Listings API endpoints
import { apiClient } from './client';
import { Listing } from '@/lib/types/api';

export const listingsApi = {
  list: async (params?: { status?: string; crop?: string; province?: string; q?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.crop) query.set('crop', params.crop);
    if (params?.province) query.set('province', params.province);
    if (params?.q) query.set('q', params.q);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<Listing[]>(`/listings${qs}`);
  },

  getById: async (id: string) => {
    return apiClient.get<Listing>(`/listings/${id}`);
  },

  create: async (data: Partial<Listing>) => {
    return apiClient.post<Listing>('/listings', data);
  },

  update: async (id: string, data: Partial<Listing>) => {
    return apiClient.put<Listing>(`/listings/${id}`, data);
  },

  remove: async (id: string) => {
    return apiClient.delete<{ success: boolean }>(`/listings/${id}`);
  },
};
