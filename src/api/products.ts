import { apiClient } from './client';
import { Product } from '../domain/Product';
import { ApiResponse } from '../domain/Common';

export const getProductById = async (id: string): Promise<ApiResponse<{ product: Product }>> => {
  const { data } = await apiClient.get(`/products/${id}`);
  return data.data;
};

export interface CreateProductPayload {
  name: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  quantityTotal?: number; // Total available quantity (same as quantity when creating)
  categoryId: string;
  pickupWindowStart: string;
  pickupWindowEnd: string;
  imageIds?: string[];
}

export const createProduct = async (payload: CreateProductPayload): Promise<ApiResponse<{ product: Product }>> => {
  const { data } = await apiClient.post('/seller/products', payload);
  return data.data;
};

export const updateProduct = async (id: string, payload: Partial<CreateProductPayload>): Promise<ApiResponse<{ product: Product }>> => {
  const { data } = await apiClient.put(`/seller/products/${id}`, payload);
  return data.data;
};

export const deleteProduct = async (id: string): Promise<ApiResponse<void>> => {
  const { data } = await apiClient.delete(`/seller/products/${id}`);
  return data.data;
};

export const getMyProducts = async (): Promise<ApiResponse<{ products: Product[] }>> => {
  const { data } = await apiClient.get('/seller/products');
  return data.data;
};
