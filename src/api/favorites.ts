import { apiClient } from './client';
import { PaginatedResponse } from '../domain/Common';
import { FavoriteStore } from '../domain/Favorite';

interface GetFavoritesParams {
    cursor?: string;
    limit?: number;
    lat?: number;
    lng?: number;
}

export const getFavorites = async (params: GetFavoritesParams): Promise<PaginatedResponse<{ favorites: FavoriteStore[] }>> => {
    const { data } = await apiClient.get('/favorites', { params });
    return data;
}

export const addFavorite = async (storeId: string): Promise<void> => {
    await apiClient.post(`/favorites/stores/${storeId}`);
}

export const removeFavorite = async (storeId: string): Promise<void> => {
    await apiClient.delete(`/favorites/stores/${storeId}`);
}
