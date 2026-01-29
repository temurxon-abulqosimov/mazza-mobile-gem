import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuthStore } from '../state/authStore';
import { LoginFormData, RegisterFormData } from '../domain/validators/AuthValidators';

export const useAuth = () => {
  const { setTokens, clearTokens } = useAuthStore((state) => state.actions);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginFormData) => authApi.login(credentials),
    onSuccess: (data) => {
      setTokens(data.tokens);
      // Here you could also set user data in another store if needed
    },
    onError: (error) => {
      // Handle login error (e.g., show a toast notification)
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

  const logout = () => {
    // Call API if it had a server-side logout
    // authApi.logout(); 
    clearTokens();
    // Here you would also clear any other user-related state
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    logout,
  };
};
