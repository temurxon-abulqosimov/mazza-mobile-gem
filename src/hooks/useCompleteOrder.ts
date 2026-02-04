
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeOrder, LiveOrder } from '../api/seller';
import { ApiResponse } from '../domain/Common';

export const useCompleteOrder = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<ApiResponse<LiveOrder>, Error, { orderId: string; qrCodeData: string }>({
        mutationFn: ({ orderId, qrCodeData }) => completeOrder(orderId, qrCodeData),
        onSuccess: () => {
            // Refresh live orders and dashboard stats
            queryClient.invalidateQueries({ queryKey: ['seller', 'orders', 'live'] });
            queryClient.invalidateQueries({ queryKey: ['seller', 'dashboard', 'stats'] });
        },
    });

    return {
        completeOrder: mutation.mutate,
        isCompleting: mutation.isPending,
        error: mutation.error,
    };
};
