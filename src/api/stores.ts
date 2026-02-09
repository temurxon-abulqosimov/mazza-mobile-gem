import { apiClient } from './client';
import { Store } from '../domain/Store';
import { Product } from '../domain/Product';
import { ApiResponse } from '../domain/Common';

export const getStoreById = async (id: string): Promise<{ store: Store }> => {
  const { data } = await apiClient.get<ApiResponse<{ store: Store }>>(`/stores/${id}`);
  return data.data;
};

export const followStore = async (id: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.post(`/stores/${id}/follow`);
  return data;
};

export const unfollowStore = async (storeId: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.delete(`/stores/${storeId}/follow`);
  return data;
};

export const getStoreProducts = async (storeId: string): Promise<ApiResponse<Product[]>> => {
  const { data } = await apiClient.get<ApiResponse<Product[]>>(`/stores/${storeId}/products`);
  return data;
};
