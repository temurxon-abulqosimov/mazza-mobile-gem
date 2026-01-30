import { apiClient } from './client';
import { PaginatedResponse } from '../domain/Common';
import { Notification } from '../domain/Notification';

interface GetNotificationsParams {
    cursor?: string;
    limit?: number;
    unreadOnly?: boolean;
}

export const getNotifications = async (params: GetNotificationsParams): Promise<PaginatedResponse<{ notifications: Notification[] }>> => {
    const { data } = await apiClient.get('/notifications', { params });
    return data.data;
};

export const getUnreadCount = async (): Promise<{ count: number }> => {
    const { data } = await apiClient.get('/notifications/unread-count');
    return data.data;
};

export const markAsRead = async (notificationIds: string[]): Promise<void> => {
    await apiClient.post('/notifications/read', { notificationIds });
};

export const markAllAsRead = async (): Promise<void> => {
    await apiClient.post('/notifications/read-all');
};
