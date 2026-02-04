import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, DashboardStats } from '../api/seller';

export const useDashboardStats = () => {
  const { data, isLoading, error, refetch } = useQuery<DashboardStats>({
    queryKey: ['seller', 'dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 2, // 2 minutes - fresh data
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  return {
    stats: data,
    isLoading,
    error,
    refetch,
  };
};
