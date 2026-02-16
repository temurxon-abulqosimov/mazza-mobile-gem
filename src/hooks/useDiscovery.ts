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
    enabled: enabled && (lat !== 0 || lng !== 0),
    staleTime: 1000 * 30, // Consider data fresh for 30 seconds
    gcTime: 1000 * 60 * 5, // Keep cached data for 5 minutes
  });

  // Reset and refetch - removes cache and fetches fresh data
  const resetAndRefetch = useCallback(async () => {
    await queryClient.resetQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Flatten pages into a single array and deduplicate by ID
  const products = (data?.pages.flatMap(page => page.data.products) ?? []).filter(
    (product, index, self) => self.findIndex(p => p.id === product.id) === index
  );

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
    enabled: enabled && (lat !== 0 || lng !== 0),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
  });

  const resetAndRefetch = useCallback(async () => {
    await queryClient.resetQueries({ queryKey });
  }, [queryClient, queryKey]);

  const stores = (data?.pages.flatMap(page => page.data.stores) ?? []).filter(
    (store, index, self) => self.findIndex(s => s.id === store.id) === index
  );

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

