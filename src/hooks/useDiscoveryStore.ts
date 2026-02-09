import { useQuery } from '@tanstack/react-query';
import { getStoreProducts } from '../api/stores';
import { Product } from '../domain/Product';

interface UseDiscoveryStoreParams {
    storeId: string;
    enabled?: boolean;
}

export const useDiscoveryStore = ({ storeId, enabled = true }: UseDiscoveryStoreParams) => {
    const {
        data: products,
        isLoading,
        error,
        refetch,
    } = useQuery<Product[]>({
        queryKey: ['store-products', storeId],
        queryFn: async (): Promise<Product[]> => {
            const response = await getStoreProducts(storeId);
            return response.data;
        },
        enabled: enabled && !!storeId,
    });

    return {
        products: products || [],
        isLoading,
        error,
        refetch,
    };
};
