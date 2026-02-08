import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { discoveryApi } from '../api';
import { PaginatedResponse } from '../domain/Common';
import { Product } from '../domain/Product';

interface DiscoveryParams {
  lat: number;
  lng: number;
  radius?: number;
  enabled?: boolean;
}

export const useDiscovery = ({ lat, lng, radius, enabled = true }: DiscoveryParams) => {
  const queryClient = useQueryClient();
  const queryKey = ['discovery', { lat, lng, radius }];

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
      lat,
      lng,
      radius,
      cursor: pageParam as string | undefined
    }),
    getNextPageParam: (lastPage) => lastPage.meta.pagination.hasMore ? lastPage.meta.pagination.cursor : undefined,
    initialPageParam: undefined,
    enabled: enabled && !!lat && !!lng,
    staleTime: 0, // Always fetch fresh data on refetch
    gcTime: 0, // Don't cache old data
  });

  // Reset and refetch - removes cache and fetches fresh data
  const resetAndRefetch = useCallback(async () => {
    await queryClient.resetQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Flatten pages into a single array
  const products = data?.pages.flatMap(page => page.data.products) ?? [];

  return {
    products,
    isLoading,
    isError,
    error,
    refetch: resetAndRefetch, // Use reset instead of refetch for pull-to-refresh
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
};
