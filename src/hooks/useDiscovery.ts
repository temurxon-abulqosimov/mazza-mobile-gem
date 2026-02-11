import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { discoveryApi } from '../api';
import { PaginatedResponse } from '../domain/Common';
import { Product } from '../domain/Product';

interface DiscoveryParams {
  lat: number;
  lng: number;
  radius?: number;
  category?: string;
  enabled?: boolean;
}

export const useDiscovery = ({ lat, lng, radius, category, enabled = true }: DiscoveryParams) => {
  const queryClient = useQueryClient();
  const queryKey = ['discovery', { lat, lng, radius, category }];

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
      category,
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

export const useDiscoveryStores = ({ lat, lng, radius, category, enabled = true }: DiscoveryParams) => {
  const queryClient = useQueryClient();
  const queryKey = ['discoveryStores', { lat, lng, radius, category }];

  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery<PaginatedResponse<{ stores: import('../domain/Store').Store[] }>>({
    queryKey,
    queryFn: ({ pageParam }) => discoveryApi.discoverStores({
      lat,
      lng,
      radius,
      category,
      cursor: pageParam as string | undefined
    }),
    getNextPageParam: (lastPage) => lastPage.meta.pagination.hasMore ? lastPage.meta.pagination.cursor : undefined,
    initialPageParam: undefined,
    enabled: enabled && !!lat && !!lng,
    staleTime: 0,
    gcTime: 0,
  });

  const resetAndRefetch = useCallback(async () => {
    await queryClient.resetQueries({ queryKey });
  }, [queryClient, queryKey]);

  const stores = data?.pages.flatMap(page => page.data.stores) ?? [];

  return {
    stores,
    isLoading,
    isError,
    error,
    refetch: resetAndRefetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
};

