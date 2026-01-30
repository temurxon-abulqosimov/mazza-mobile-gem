import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api';

export const useProduct = (productId: string) => {
  const queryKey = ['product', productId];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => productApi.getProductById(productId),
    enabled: !!productId, // Only run if productId is available
  });

  return {
    product: data?.product,
    isLoading,
    isError,
    error,
    refetch,
  };
};
