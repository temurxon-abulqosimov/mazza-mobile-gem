import { useInfiniteQuery } from '@tanstack/react-query';
import { favoriteApi } from '../api';

interface UseFavoritesParams {
  lat?: number;
  lng?: number;
}

export const useFavorites = ({ lat, lng }: UseFavoritesParams) => {
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
    getNextPageParam: (lastPage) => lastPage.meta.pagination.cursor,
    enabled: !!lat && !!lng, // Only run if location is available
  });

  const favorites = data?.pages.flatMap(page => page.data.favorites) ?? [];

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
