import { useInfiniteQuery } from '@tanstack/react-query';
import { favoriteApi } from '../api';
import { useAuthStore } from '../state/authStore';

interface UseFavoritesParams {
  type?: 'STORE' | 'PRODUCT';
  lat?: number;
  lng?: number;
}

export const useFavorites = ({ type, lat, lng }: UseFavoritesParams) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;

  const queryKey = ['favorites', { type, lat, lng }];

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => favoriteApi.getFavorites({ type, cursor: pageParam, lat, lng }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isAuthenticated, // Only requires authentication, location is optional for distance calculation
  });

  const favorites = data?.pages.flatMap(page => page.favorites) ?? [];

  return {
    favorites,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  };
};
