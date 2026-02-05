import { useInfiniteQuery } from '@tanstack/react-query';
import { favoriteApi } from '../api';
import { useAuthStore } from '../state/authStore';

interface UseFavoritesParams {
  lat?: number;
  lng?: number;
}

export const useFavorites = ({ lat, lng }: UseFavoritesParams) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;

  const queryKey = ['favorites', { lat, lng }];

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => favoriteApi.getFavorites({ cursor: pageParam, lat, lng }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: isAuthenticated && !!lat && !!lng, // Only run if authenticated AND location is available
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
  };
};
