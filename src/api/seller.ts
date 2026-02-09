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
    categoryId: string;
}

export const apply = async (payload: SellerApplicationPayload): Promise<ApiResponse<any>> => {
    const { data } = await apiClient.post('/seller/apply', payload);
    return data;
};

export interface DashboardStats {
    todaysEarnings: number;
    earningsChange: number;
    ordersRescued: number;
    activeListings: number;
    isOpen: boolean;
}

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
    const { data } = await apiClient.get('/seller/dashboard/stats');
    return data;
};

export interface SellerDashboardResponse {
    store: {
        id: string;
        name: string;
        imageUrl: string | null;
        categories: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
        }[];
    };
    stats: {
        period: string;
        posted: number;
        postedChange: number;
        sold: number;
        revenue: number;
        foodSaved: number;
    };
}

export const getSellerDashboard = async (): Promise<ApiResponse<SellerDashboardResponse>> => {
    const { data } = await apiClient.get('/seller/dashboard');
    return data;
};

export interface StoreStatus {
    isOpen: boolean;
}

export const toggleStoreStatus = async (isOpen: boolean): Promise<ApiResponse<StoreStatus>> => {
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

export const getLiveOrders = async (): Promise<ApiResponse<LiveOrder[]>> => {
    const { data } = await apiClient.get('/seller/orders/live');
    return data;
};

export const completeOrder = async (orderId: string, qrCodeData: string): Promise<ApiResponse<LiveOrder>> => {
    const { data } = await apiClient.post(`/seller/orders/${orderId}/complete`, { qrCodeData });
    return data;
};
