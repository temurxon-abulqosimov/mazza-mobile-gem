import { useQuery } from '@tanstack/react-query';
import { discoveryApi } from '../api';
import { PaginatedResponse } from '../domain/Common';
import { Product } from '../domain/Product';

interface DiscoveryParams {
  lat: number;
  lng: number;
  radius?: number;
  enabled?: boolean; // To control whether the query should run
}

export const useDiscovery = ({ lat, lng, radius, enabled = true }: DiscoveryParams) => {
  const queryKey = ['discovery', { lat, lng, radius }];

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery<PaginatedResponse<{ products: Product[] }>>({
    queryKey,
    queryFn: () => discoveryApi.discoverProducts({ lat, lng, radius }),
    enabled: enabled && !!lat && !!lng, // Only run if enabled and lat/lng are available
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });

  return {
    products: data?.data.products ?? [],
    pagination: data?.meta?.pagination,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  };
};
