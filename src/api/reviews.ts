import { apiClient } from './client';
import { ApiResponse, PaginatedResponse } from '../domain/Common';

export interface CreateReviewPayload {
    bookingId: string;
    rating: number;
    comment?: string;
}

export interface Review {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    reviewer: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
    };
}

export const createReview = async (payload: CreateReviewPayload): Promise<ApiResponse<Review>> => {
    const { data } = await apiClient.post('/reviews', payload);
    return data;
};

export const getStoreReviews = async (storeId: string, page = 1, limit = 10): Promise<PaginatedResponse<Review[]>> => {
    const { data } = await apiClient.get(`/reviews/store/${storeId}`, {
        params: { page, limit }
    });
    return data;
};
