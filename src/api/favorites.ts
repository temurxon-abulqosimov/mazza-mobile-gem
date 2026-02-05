import { apiClient } from './client';
import { FavoriteStore } from '../domain/Favorite';

interface GetFavoritesParams {
    cursor?: string;
    limit?: number;
    lat?: number;
    lng?: number;
}

interface FavoritesResponse {
    favorites: FavoriteStore[];
    total: number;
    nextCursor?: string;
}

export const getFavorites = async (params: GetFavoritesParams): Promise<FavoritesResponse> => {
    const { data } = await apiClient.get('/favorites', { params });
    return data;
}

export const addFavorite = async (storeId: string): Promise<void> => {
    await apiClient.post(`/favorites/stores/${storeId}`);
}

export const removeFavorite = async (storeId: string): Promise<void> => {
    await apiClient.delete(`/favorites/stores/${storeId}`);
}
