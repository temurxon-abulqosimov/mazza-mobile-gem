import { useQuery } from '@tanstack/react-query';
import { getLiveOrders, LiveOrder } from '../api/seller';
import { ApiResponse } from '../domain/Common';

export const useLiveOrders = () => {
  const { data, isLoading, error, refetch } = useQuery<LiveOrder[]>({
    queryKey: ['seller', 'orders', 'live'],
    queryFn: async (): Promise<LiveOrder[]> => {
      const response = await getLiveOrders();
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds - data is fresh
    refetchInterval: 1000 * 60, // Refetch every minute for real-time updates
  });

  return {
    orders: data || [],
    isLoading,
    error,
    refetch,
  };
};
