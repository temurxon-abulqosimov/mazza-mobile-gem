import { useState, useEffect, useCallback } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform, Alert } from 'react-native';
import { useAuth } from './useAuth';
import { config } from '../config/environment';

// Must be called at module scope so the browser auth session can complete
WebBrowser.maybeCompleteAuthSession();

interface UseGoogleSignInOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useGoogleSignIn = (options?: UseGoogleSignInOptions) => {
  const { googleAuth, isGoogleAuthPending } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // For Expo Go on Android/iOS, the web client ID is what drives the OAuth flow.
  // A dedicated Android/iOS client ID is only needed for standalone/dev-client builds.
  const webClientId = config.googleAuth.webClientId;
  const iosClientId = config.googleAuth.iosClientId;
  const androidClientId = config.googleAuth.androidClientId;

  // We need at minimum a web client ID (used by Expo Go on all platforms)
  const isConfigured = !!webClientId;

  const redirectUri = makeRedirectUri({
    scheme: 'mazza',
    // Use native redirect on standalone builds, otherwise the default works for Expo Go
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId || undefined,
    iosClientId: iosClientId || undefined,
    androidClientId: androidClientId || undefined,
    scopes: ['profile', 'email', 'openid'],
    redirectUri,
    // On Expo Go this is ignored; on standalone it uses native redirect
  });

  useEffect(() => {
    if (request) {
      console.log('[GoogleSignIn] Ready. Redirect URI:', request.redirectUri);
      console.log('[GoogleSignIn] Platform:', Platform.OS);
    }
  }, [request]);

  // Handle the OAuth response
  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const auth = response.authentication;
      // Prefer ID token if available (from web client), fall back to access token
      const token = auth?.idToken || auth?.accessToken;
      if (token) {
        handleGoogleAuth(token);
      } else {
        setIsLoading(false);
        console.error('[GoogleSignIn] No token in response');
        options?.onError?.(new Error('No authentication token received'));
      }
    } else if (response.type === 'error') {
      setIsLoading(false);
      console.error('[GoogleSignIn] Error:', response.error);
      const error = new Error(response.error?.message || 'Google Sign-In failed');
      options?.onError?.(error);
    } else if (response.type === 'dismiss' || response.type === 'cancel') {
      setIsLoading(false);
    }
  }, [response]);

  const handleGoogleAuth = useCallback(async (token: string) => {
    try {
      googleAuth(
        { idToken: token },
        {
          onSuccess: () => {
            setIsLoading(false);
            options?.onSuccess?.();
          },
          onError: (error: any) => {
            setIsLoading(false);
            const message =
              error.response?.data?.error?.message ||
              error.response?.data?.message ||
              'Failed to sign in with Google';
            Alert.alert('Sign-In Failed', message);
            options?.onError?.(error);
          },
        },
      );
    } catch (error: any) {
      setIsLoading(false);
      options?.onError?.(error);
    }
  }, [googleAuth, options]);

  const signInWithGoogle = useCallback(async () => {
    if (!isConfigured) {
      console.warn('[GoogleSignIn] Not configured — set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID');
      Alert.alert(
        'Not Configured',
        'Google Sign-In is not set up yet. Please use email login.',
      );
      return;
    }
    if (!request) {
      console.warn('[GoogleSignIn] Auth request not ready yet');
      return;
    }
    setIsLoading(true);
    try {
      await promptAsync();
    } catch (err) {
      console.error('[GoogleSignIn] promptAsync error:', err);
      setIsLoading(false);
    }
  }, [isConfigured, request, promptAsync]);

  return {
    signInWithGoogle,
    isLoading: isLoading || isGoogleAuthPending,
    isReady: isConfigured && !!request,
    isConfigured,
  };
};
