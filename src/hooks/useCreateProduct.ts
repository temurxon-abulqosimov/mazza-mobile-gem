import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProduct, getMyProducts, CreateProductPayload } from '../api/products';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => createProduct(payload),
    onSuccess: () => {
      // Invalidate product lists to refetch
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
    },
  });

  return {
    createProduct: mutation.mutateAsync,
    isCreating: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
};

export const useMyProducts = () => {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['myProducts'],
    queryFn: () => getMyProducts(),
  });

  return {
    products: data?.data.products ?? [],
    isLoading,
    isError,
    error,
    refetch,
  };
};
