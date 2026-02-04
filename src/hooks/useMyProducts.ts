import { useQuery } from '@tanstack/react-query';
import { getMyProducts } from '../api/products';

export const useMyProducts = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['myProducts'],
    queryFn: getMyProducts,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    products: data?.data.products ?? [],
    isLoading,
    isError,
    error,
    refetch,
  };
};
