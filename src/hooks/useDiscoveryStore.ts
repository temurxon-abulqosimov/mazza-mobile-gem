import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { discoveryApi } from '../api';
import { PaginatedResponse } from '../domain/Common';
import { Product } from '../domain/Product';

interface UseDiscoveryStoreParams {
    storeId: string;
    enabled?: boolean;
}

export const useDiscoveryStore = ({ storeId, enabled = true }: UseDiscoveryStoreParams) => {
    const queryClient = useQueryClient();
    const queryKey = ['discovery', 'store', storeId];

    const {
        data,
        isLoading,
        isError,
        error,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useInfiniteQuery<PaginatedResponse<{ products: Product[] }>>({
        queryKey,
        queryFn: ({ pageParam }) => discoveryApi.discoverProducts({
            storeId,
            cursor: pageParam as string | undefined,
            limit: 20,
        }),
        getNextPageParam: (lastPage) => lastPage.meta.pagination.hasMore ? lastPage.meta.pagination.cursor : undefined,
        initialPageParam: undefined,
        enabled: enabled && !!storeId,
        staleTime: 60 * 1000, // 1 minute stale time for store products
        gcTime: 5 * 60 * 1000, // 5 minutes cache
    });

    // Reset and refetch
    const refetch = useCallback(async () => {
        await queryClient.resetQueries({ queryKey });
    }, [queryClient, queryKey]);

    const products = data?.pages.flatMap(page => page.data.products) ?? [];

    return {
        products,
        isLoading,
        isError,
        error,
        refetch,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    };
};
