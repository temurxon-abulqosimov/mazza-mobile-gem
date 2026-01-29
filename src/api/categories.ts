import { apiClient } from './client';
import { Category } from '../domain/Category';
import { ApiResponse } from '../domain/Common';

export const getCategories = async (): Promise<ApiResponse<{ categories: Category[] }>> => {
  const { data } = await apiClient.get('/categories');
  return data;
};
