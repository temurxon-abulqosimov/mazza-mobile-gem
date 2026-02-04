import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleStoreStatus, StoreStatus } from '../api/seller';

export const useStoreStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<StoreStatus, Error, boolean>({
    mutationFn: (isOpen: boolean) => toggleStoreStatus(isOpen),
    onSuccess: () => {
      // Invalidate dashboard stats to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['seller', 'dashboard', 'stats'] });
    },
  });

  return {
    toggleStatus: mutation.mutate,
    isToggling: mutation.isPending,
    error: mutation.error,
  };
};
