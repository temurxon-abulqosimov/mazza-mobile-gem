import { apiClient } from './client';
import { Store } from '../domain/Store';
import { ApiResponse } from '../domain/Common';

export const getStoreById = async (id: string): Promise<ApiResponse<{ store: Store }>> => {
  const { data } = await apiClient.get(`/stores/${id}`);
  return data.data;
};
