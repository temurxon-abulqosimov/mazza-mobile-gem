import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '../api';
import { v4 as uuidv4 } from 'uuid';

interface CreateBookingParams {
  productId: string;
  quantity: number;
  paymentMethodId: string; // This would come from a payment provider integration
}

export const useBooking = () => {
  const queryClient = useQueryClient();

  const createBookingMutation = useMutation({
    mutationFn: (params: CreateBookingParams) => {
      const idempotencyKey = uuidv4();
      return bookingApi.createBooking(params, idempotencyKey);
    },
    onSuccess: (data) => {
      // Invalidate queries that should be updated after a booking
      queryClient.invalidateQueries({ queryKey: ['discovery'] }); // Refetch product lists
      queryClient.invalidateQueries({ queryKey: ['product', data.data.booking.product.id] }); // Refetch this product's details
      queryClient.invalidateQueries({ queryKey: ['bookings', 'active'] }); // Invalidate active bookings list
    },
    onError: (error) => {
      console.error('Booking failed:', error);
      // Error is handled in the component via mutation.isError
    },
  });

  return {
    createBooking: createBookingMutation.mutate,
    createBookingAsync: createBookingMutation.mutateAsync,
    isCreatingBooking: createBookingMutation.isPending,
    bookingError: createBookingMutation.error,
    bookingData: createBookingMutation.data,
  };
};
