import { apiClient } from './client';
import { ApiResponse } from '../domain/Common';

interface SellerApplicationPayload {
    businessName: string;
    description: string;
    address: string;
    city: string;
    lat: number;
    lng: number;
    phone?: string;
}

export const apply = async (payload: SellerApplicationPayload): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post('/seller/apply', payload);
    return data.data;
};
