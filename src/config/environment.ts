import { Platform } from 'react-native';

/**
 * Environment Configuration
 *
 * Access environment variables using process.env with EXPO_PUBLIC_ prefix
 *
 * Required environment variables for full functionality:
 *
 * 1. API URL:
 *    EXPO_PUBLIC_API_URL=https://your-api-url.com/api/v1
 *
 * 2. Google Maps API keys (for map functionality):
 *    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=your_android_key
 *    EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=your_ios_key
 *
 * 3. Google OAuth Client IDs (for Google Sign-In):
 *    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your_web_client_id.apps.googleusercontent.com
 *    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id.apps.googleusercontent.com
 *    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id.apps.googleusercontent.com
 *
 * To set up Google Sign-In:
 * 1. Go to Google Cloud Console: https://console.cloud.google.com/
 * 2. Create OAuth 2.0 credentials for Web, iOS, and Android
 * 3. Add the client IDs to your .env file
 * 4. Restart the Expo server
 */

export const config = {
  // API URL - must use EXPO_PUBLIC_ prefix for client-side access
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',

  // Google Maps API Keys
  googleMaps: {
    apiKey: Platform.select({
      android: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || '',
      ios: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || '',
      default: '',
    }),
  },

  // Google OAuth Client IDs
  googleAuth: {
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  },
};

/**
 * Check if Google Maps is properly configured
 */
export const isGoogleMapsConfigured = (): boolean => {
  return !!config.googleMaps.apiKey;
};

/**
 * Check if Google Sign-In is properly configured
 * Only the Web Client ID is required (used by Expo Go on all platforms).
 * Platform-specific client IDs are optional and used in standalone builds.
 */
export const isGoogleAuthConfigured = (): boolean => {
  return !!config.googleAuth.webClientId;
};

/**
 * Get configuration warnings
 */
export const getConfigWarnings = (): string[] => {
  const warnings: string[] = [];

  if (!config.googleMaps.apiKey) {
    warnings.push(
      'Google Maps API key not configured. Map functionality will be limited. ' +
      'Please add your API key to the .env file.'
    );
  }

  if (!isGoogleAuthConfigured()) {
    warnings.push(
      'Google Sign-In not configured. Add Google OAuth client IDs to enable Google Sign-In.'
    );
  }

  return warnings;
};

export default config;
