
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { completeOrder } from '../api/seller';

interface CompleteOrderResponse {
    success: boolean;
    data: {
        order: {
            id: string;
            status: string;
            completedAt: string;
        };
    };
}

export const useCompleteOrder = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation<CompleteOrderResponse, Error, { orderId: string; qrCodeData: string }>({
        mutationFn: ({ orderId, qrCodeData }) => completeOrder(orderId, qrCodeData),
        onSuccess: () => {
            // Refresh live orders and dashboard stats
            queryClient.invalidateQueries({ queryKey: ['seller', 'orders', 'live'] });
            queryClient.invalidateQueries({ queryKey: ['seller', 'dashboard', 'stats'] });
        },
    });

    return {
        completeOrderAsync: mutation.mutateAsync,
        isCompleting: mutation.isPending,
        resetMutation: mutation.reset,
        error: mutation.error,
    };
};
