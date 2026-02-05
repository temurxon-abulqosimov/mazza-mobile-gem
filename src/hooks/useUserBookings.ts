import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../api';
import { useAuthStore } from '../state/authStore';

interface UseUserBookingsParams {
  status: 'active' | 'past';
}

export const useUserBookings = ({ status }: UseUserBookingsParams) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;

  const queryKey = ['bookings', status];

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn: () => bookingApi.getUserBookings(status),
    enabled: isAuthenticated, // Only fetch if authenticated
  });

  // Data structure is now { bookings: [...] }
  const bookings = data?.bookings ?? [];

  console.log('useUserBookings - isAuthenticated:', isAuthenticated);
  console.log('useUserBookings - data:', data);
  console.log('useUserBookings - bookings:', bookings);
  console.log('useUserBookings - isLoading:', isLoading);
  console.log('useUserBookings - isError:', isError);

  return {
    bookings,
    isLoading,
    isError,
    // Add dummy pagination props to maintain component compatibility if needed, else remove
    fetchNextPage: () => { },
    hasNextPage: false,
    isFetchingNextPage: false,
    refetch,
    isRefetching,
  };
};
