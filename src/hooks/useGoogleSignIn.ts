import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { Platform, Alert } from 'react-native';
import { useAuth } from './useAuth';
import { config, isGoogleAuthConfigured } from '../config/environment';

// Register for the auth session to complete properly
WebBrowser.maybeCompleteAuthSession();

interface UseGoogleSignInOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Check if we have the required client ID for this platform
const hasRequiredClientId = (): boolean => {
  if (Platform.OS === 'ios') {
    return !!config.googleAuth.iosClientId;
  }
  if (Platform.OS === 'android') {
    return !!config.googleAuth.androidClientId;
  }
  return !!config.googleAuth.webClientId;
};

export const useGoogleSignIn = (options?: UseGoogleSignInOptions) => {
  const { googleAuth, isGoogleAuthPending } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Only configure Google auth if we have the required credentials
  const isConfigured = hasRequiredClientId();

  // Use placeholder values when not configured to avoid hook errors
  const [request, response, promptAsync] = Google.useAuthRequest(
    isConfigured
      ? {
          webClientId: config.googleAuth.webClientId || undefined,
          iosClientId: config.googleAuth.iosClientId || undefined,
          androidClientId: config.googleAuth.androidClientId || undefined,
          scopes: ['profile', 'email'],
        }
      : {
          // Provide a dummy config when not set up to avoid crash
          // The hook still needs to be called but won't be used
          clientId: 'not-configured',
          scopes: ['profile', 'email'],
        }
  );

  useEffect(() => {
    if (!isConfigured) return;

    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleAuth(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      setIsLoading(false);
      const error = new Error(response.error?.message || 'Google Sign-In failed');
      options?.onError?.(error);
    } else if (response?.type === 'dismiss') {
      setIsLoading(false);
    }
  }, [response, isConfigured]);

  const handleGoogleAuth = async (accessToken: string) => {
    try {
      googleAuth(
        { idToken: accessToken },
        {
          onSuccess: () => {
            setIsLoading(false);
            options?.onSuccess?.();
          },
          onError: (error: any) => {
            setIsLoading(false);
            const message = error.response?.data?.message || 'Failed to sign in with Google';
            Alert.alert('Sign-In Failed', message);
            options?.onError?.(error);
          },
        }
      );
    } catch (error: any) {
      setIsLoading(false);
      options?.onError?.(error);
    }
  };

  const signInWithGoogle = async () => {
    if (!isConfigured || !request) {
      // Silently fail - button should be hidden when not configured
      console.log('Google Sign-In not configured for this platform');
      return;
    }
    setIsLoading(true);
    await promptAsync();
  };

  return {
    signInWithGoogle,
    isLoading: isLoading || isGoogleAuthPending,
    isReady: isConfigured && !!request,
    isConfigured,
  };
};
