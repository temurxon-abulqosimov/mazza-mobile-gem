import { useQuery } from '@tanstack/react-query';
import { userApi } from '../api';
import { useAuthStore } from '../state/authStore';

export const useUserProfile = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;

  const queryKey = ['userProfile', 'me'];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: () => userApi.getMe(),
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  return {
    userProfile: data?.data.user,
    isLoading: isAuthenticated ? isLoading : false,
    isError: isAuthenticated ? isError : false,
    error,
    refetch,
  };
};
