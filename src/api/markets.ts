import { apiClient } from './client';
import { Market } from '../domain/Market';
import { ApiResponse } from '../domain/Common';

export const getMarkets = async (): Promise<ApiResponse<{ markets: Market[] }>> => {
  const { data } = await apiClient.get('/markets');
  return data;
};

export const getMarketById = async (id: string): Promise<ApiResponse<{ market: Market }>> => {
    const { data } = await apiClient.get(`/markets/${id}`);
    return data;
}
