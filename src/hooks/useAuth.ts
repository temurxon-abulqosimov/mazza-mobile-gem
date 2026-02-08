import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuthStore } from '../state/authStore';
import { LoginFormData, RegisterFormData } from '../domain/validators/AuthValidators';

interface GoogleAuthParams {
  idToken: string;
  marketId?: string;
}

export const useAuth = () => {
  const { setTokens, clearTokens } = useAuthStore((state) => state.actions);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) => authApi.login(credentials),
    onSuccess: (data) => {
      setTokens(data.tokens);
    },
    onError: (error) => {
      console.error('Login failed:', error);
      clearTokens();
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: RegisterFormData) => authApi.register(userData),
    onSuccess: (data) => {
      setTokens(data.tokens);
    },
    onError: (error) => {
      console.error('Registration failed:', error);
      clearTokens();
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: (params: GoogleAuthParams) => authApi.googleAuth(params.idToken, params.marketId),
    onSuccess: (data) => {
      setTokens(data.tokens);
    },
    onError: (error) => {
      console.error('Google auth failed:', error);
      clearTokens();
    },
  });

  const logout = () => {
    clearTokens();
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    googleAuth: googleAuthMutation.mutate,
    isGoogleAuthPending: googleAuthMutation.isPending,
    googleAuthError: googleAuthMutation.error,

    logout,
  };
};
