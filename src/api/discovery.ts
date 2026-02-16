import { apiClient } from './client';
import { PaginatedResponse } from '../domain/Common';
import { Product } from '../domain/Product';
import { Store } from '../domain/Store';

interface DiscoveryParams {
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  cursor?: string;
  category?: string;
  storeId?: string;
}

export const discoverProducts = async (params: DiscoveryParams): Promise<PaginatedResponse<{ products: Product[] }>> => {
  const { data } = await apiClient.get('/discovery/products', { params });
  return data;
};

export const discoverStores = async (params: DiscoveryParams): Promise<PaginatedResponse<{ stores: Store[] }>> => {
  const { data } = await apiClient.get('/discovery/stores', { params });
  return data;
};

interface SearchParams {
  q: string;
  lat: number;
  lng: number;
  limit?: number;
}

interface SearchResults {
  products: Product[];
  stores: Store[];
}

export const search = async (params: SearchParams): Promise<SearchResults> => {
  const { data } = await apiClient.get('/discovery/search', { params });
  return data.data ?? { products: [], stores: [] };
}
