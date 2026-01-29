import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sellerApi } from '../api';
import { SellerApplicationFormData } from '../domain/validators/SellerValidators';

export const useSeller = () => {
  const queryClient = useQueryClient();

  const applyMutation = useMutation({
    mutationFn: (data: SellerApplicationFormData) => sellerApi.apply(data),
    onSuccess: () => {
      // Invalidate user profile to refetch and potentially get an updated role
      queryClient.invalidateQueries({ queryKey: ['userProfile', 'me'] });
    },
  });

  return {
    applyAsSeller: applyMutation.mutateAsync,
    isApplying: applyMutation.isPending,
  };
};
