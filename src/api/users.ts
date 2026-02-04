import { apiClient } from './client';
import { UserProfile } from '../domain/User';
import { ApiResponse } from '../domain/Common';

export const getMe = async (): Promise<ApiResponse<{ user: UserProfile }>> => {
  const { data } = await apiClient.get('/users/me');
  return data;
};

export const updateMe = async (profileData: { fullName?: string; avatarUrl?: string }): Promise<ApiResponse<{ user: UserProfile }>> => {
  const { data } = await apiClient.patch('/users/me', profileData);
  return data;
};
