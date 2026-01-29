import { apiClient } from './client';
import { ApiResponse } from '../domain/Common';

interface SellerApplicationPayload {
    businessName: string;
    businessType: string; // e.g., 'RESTAURANT', 'CAFE'
    description: string;
    phoneNumber: string;
}

export const apply = async (payload: SellerApplicationPayload): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post('/seller/apply', payload);
    return data;
};

// Other seller endpoints would go here
