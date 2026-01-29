import { apiClient } from './client';
import { LoginFormData, RegisterFormData } from '../domain/validators/AuthValidators';
import { User } from '../domain/User';

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const login = async (credentials: LoginFormData): Promise<AuthResponse> => {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
};

export const register = async (userData: RegisterFormData): Promise<AuthResponse> => {
  const { data } = await apiClient.post('/auth/register', userData);
  return data;
};

export const logout = async (): Promise<void> => {
    // The backend doesn't seem to have a /auth/logout that requires a token,
    // but if it did, it would be called here.
    // Frontend logout is primarily clearing tokens.
    await Promise.resolve();
};

export const refreshToken = async (token: string): Promise<{ accessToken: string; refreshToken: string; }> => {
    const { data } = await apiClient.post('/auth/refresh', { refreshToken: token });
    return data.tokens;
}
