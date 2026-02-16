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

};

/**
 * Check if Google Maps is properly configured
 */
export const isGoogleMapsConfigured = (): boolean => {
  return !!config.googleMaps.apiKey;
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

  return warnings;
};

export default config;
