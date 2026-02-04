import { apiClient } from './client';
import { Category } from '../domain/Category';
import { ApiResponse } from '../domain/Common';

export const getCategories = async (): Promise<{ categories: Category[] }> => {
  const { data } = await apiClient.get('/categories');
  // Backend returns: { success: true, data: { categories: [...] }, meta: {...} }
  return data.data;
};
