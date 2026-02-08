import { apiClient } from './client';
import { Store } from '../domain/Store';
import { ApiResponse } from '../domain/Common';

export const getStoreById = async (id: string): Promise<{ store: Store }> => {
  const { data } = await apiClient.get<ApiResponse<{ store: Store }>>(`/stores/${id}`);
  return data.data;
};
export const followStore = async (id: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.post(`/stores/${id}/follow`);
  return data;
};

export const unfollowStore = async (id: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.delete(`/stores/${id}/unfollow`);
  return data;
};
