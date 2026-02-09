import { useQuery } from '@tanstack/react-query';
import { getSellerDashboard, SellerDashboardResponse } from '../api/seller';
import { ApiResponse } from '../domain/Common';

export const useSellerDashboard = () => {
    const { data, isLoading, error, refetch } = useQuery<ApiResponse<SellerDashboardResponse>>({
        queryKey: ['seller', 'dashboard'],
        queryFn: getSellerDashboard,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        dashboard: data?.data,
        isLoading,
        error,
        refetch,
    };
};
