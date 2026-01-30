import { apiClient } from './client';
import { Product } from '../domain/Product';
import { ApiResponse } from '../domain/Common';

export const getProductById = async (id: string): Promise<ApiResponse<{ product: Product }>> => {
  const { data } = await apiClient.get(`/products/${id}`);
  return data.data;
};
