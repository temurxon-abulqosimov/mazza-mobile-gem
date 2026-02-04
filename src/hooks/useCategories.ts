import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/categories';

export const useCategories = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since categories rarely change
  });

  return {
    categories: data?.categories ?? [],
    isLoading,
    isError,
    error,
  };
};
