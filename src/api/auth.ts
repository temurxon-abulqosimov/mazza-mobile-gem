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
  return data.data; // Extract the actual data from the wrapper
};

export const register = async (userData: RegisterFormData): Promise<AuthResponse> => {
  const { data } = await apiClient.post('/auth/register', userData);
  return data.data; // Extract the actual data from the wrapper
};

export const logout = async (): Promise<void> => {
  // The backend doesn't seem to have a /auth/logout that requires a token,
  // but if it did, it would be called here.
  // Frontend logout is primarily clearing tokens.
  await Promise.resolve();
};

export const refreshToken = async (token: string): Promise<{ accessToken: string; refreshToken: string; }> => {
  const { data } = await apiClient.post('/auth/refresh', { refreshToken: token });
  return data.data.tokens; // Extract tokens from the nested data structure
}

interface GoogleAuthResponse extends AuthResponse {
  isNewUser: boolean;
}

export const googleAuth = async (idToken: string, marketId?: string): Promise<GoogleAuthResponse> => {
  const { data } = await apiClient.post('/auth/google', { idToken, marketId });
  return data.data;
};

export const forgotPassword = async (email: string): Promise<void> => {
  await apiClient.post('/auth/forgot-password', { email });
};

export const verifyOtp = async (email: string, otp: string): Promise<void> => {
  await apiClient.post('/auth/verify-otp', { email, otp });
};

export const resetPassword = async (data: { email: string; otp: string; newPassword: string }): Promise<void> => {
  await apiClient.post('/auth/reset-password', data);
};
