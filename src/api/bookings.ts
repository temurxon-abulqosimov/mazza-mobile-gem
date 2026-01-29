import { apiClient } from './client';
import { Booking } from '../domain/Booking';
import { PaginatedResponse, ApiResponse } from '../domain/Common';

interface CreateBookingPayload {
    productId: string;
    quantity: number;
    paymentMethodId: string;
}

export const createBooking = async (payload: CreateBookingPayload, idempotencyKey: string): Promise<ApiResponse<{ booking: Booking }>> => {
  const { data } = await apiClient.post('/bookings', payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return data;
};

export const getUserBookings = async (status: 'active' | 'past', cursor?: string): Promise<PaginatedResponse<{ bookings: Booking[] }>> => {
    const { data } = await apiClient.get('/bookings', { params: { status, cursor } });
    return data;
};

export const getBookingById = async (id: string): Promise<ApiResponse<{ booking: Booking }>> => {
    const { data } = await apiClient.get(`/bookings/${id}`);
    return data;
}

export const cancelBooking = async (id: string, reason: string): Promise<ApiResponse<{ booking: Booking }>> => {
    const { data } = await apiClient.post(`/bookings/${id}/cancel`, { reason });
    return data;
}