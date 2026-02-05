import { apiClient } from './client';
import { FavoriteStore, FavoriteProduct } from '../domain/Favorite';

interface GetFavoritesParams {
    type?: 'STORE' | 'PRODUCT';
    cursor?: string;
    limit?: number;
    lat?: number;
    lng?: number;
}

interface FavoritesResponse {
    favorites: (FavoriteStore | FavoriteProduct)[];
    total: number;
    nextCursor?: string;
}

export const getFavorites = async (params: GetFavoritesParams): Promise<FavoritesResponse> => {
    const { data } = await apiClient.get('/favorites', { params });
    return data.data; // Unwrap ApiResponse envelope
}

export const addFavoriteStore = async (storeId: string): Promise<void> => {
    await apiClient.post(`/favorites/stores/${storeId}`);
}

export const removeFavoriteStore = async (storeId: string): Promise<void> => {
    await apiClient.delete(`/favorites/stores/${storeId}`);
}

export const addFavoriteProduct = async (productId: string): Promise<void> => {
    await apiClient.post(`/favorites/products/${productId}`);
}

export const removeFavoriteProduct = async (productId: string): Promise<void> => {
    await apiClient.delete(`/favorites/products/${productId}`);
}

// Keep old API for backward compatibility
export const addFavorite = addFavoriteStore;
export const removeFavorite = removeFavoriteStore;
