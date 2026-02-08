import { useQuery } from '@tanstack/react-query';
import { getStoreById } from '../api/stores';
import { Store } from '../domain/Store';

export const useStore = (storeId: string) => {
    const { data, isLoading, error, refetch } = useQuery<{ store: Store }>({
        queryKey: ['store', storeId],
        queryFn: async () => {
            const response = await getStoreById(storeId);
            // The api/stores.ts getStoreById returns ApiResponse<{ store: Store }>.data which is { store: Store }
            // So response is { store: Store }
            return response;
        },
        enabled: !!storeId,
    });

    return {
        store: data?.store,
        isLoading,
        error,
        refetch,
    };
};
