import { useQuery } from '@tanstack/react-query';
import { bookingApi } from '../api';

export const useBookingDetail = (bookingId: string) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingApi.getBookingById(bookingId),
    enabled: !!bookingId, // Only run query if bookingId is available
  });

  return {
    booking: data?.booking,
    isLoading,
    isError,
    refetch,
  };
};
