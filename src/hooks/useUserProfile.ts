import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api';

export const useUserProfile = () => {
  const queryKey = ['userProfile', 'me'];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => userApi.getMe(),
  });

  return {
    userProfile: data?.data.user,
    isLoading,
    isError,
    error,
    refetch,
  };
};
