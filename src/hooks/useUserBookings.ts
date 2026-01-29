import { useInfiniteQuery } from '@tanstack/react-query';
import { bookingApi } from '../api';

interface UseUserBookingsParams {
  status: 'active' | 'past';
}

export const useUserBookings = ({ status }: UseUserBookingsParams) => {
  const queryKey = ['bookings', status];

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
    queryFn: ({ pageParam }) => bookingApi.getUserBookings(status, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.meta.pagination.cursor,
  });

  // Flatten the pages array into a single array of bookings
  const bookings = data?.pages.flatMap(page => page.data.bookings) ?? [];

  return {
    bookings,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};
