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

export interface DashboardStats {
    todaysEarnings: number;
    earningsChange: number;
    ordersRescued: number;
    activeListings: number;
    isOpen: boolean;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get('/seller/dashboard/stats');
    return data;
};

export interface StoreStatus {
    isOpen: boolean;
}

export const toggleStoreStatus = async (isOpen: boolean): Promise<StoreStatus> => {
    const { data } = await apiClient.put('/seller/store/status', { isOpen });
    return data;
};

export interface LiveOrder {
    id: string;
    orderNumber: string;
    quantity: number;
    totalPrice: number;
    status: string;
    pickupWindowStart: string;
    pickupWindowEnd: string;
    createdAt: string;
    customer: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
    };
    product: {
        id: string;
        name: string;
        imageUrl: string | null;
    };
    payment: {
        status: string;
    };
}

export const getLiveOrders = async (): Promise<LiveOrder[]> => {
    const { data } = await apiClient.get('/seller/orders/live');
    return data;
};
