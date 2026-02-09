import { apiClient } from './client';
import { Category } from '../domain/Category';
import { ApiResponse } from '../domain/Common';

export const getCategories = async (): Promise<{ categories: Category[] }> => {
  const { data } = await apiClient.get('/categories');
  // Backend returns: { success: true, data: { categories: [...] }, meta: {...} }
  return data.data;
};

export const getCategoryImages = async (): Promise<Record<string, string[]>> => {
  try {
    console.log('Requesting category images...');
    const { data } = await apiClient.get('/categories/images');
    console.log('Category images fetched successfully');
    return data;
  } catch (error) {
    console.error('Error fetching category images:', error);
    throw error;
  }
};
