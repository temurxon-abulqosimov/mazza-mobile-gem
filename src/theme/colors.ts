/**
 * Mazza App Color Palette
 * Based on video analysis and design system
 */

export const colors = {
  // Primary Colors
  primary: '#FF6B35',
  primaryLight: '#FF8555',
  primaryDark: '#E55420',
  primaryBackground: '#FFF5F2',

  // Secondary Colors
  secondary: '#4CAF50',
  secondaryLight: '#6BC26D',
  secondaryDark: '#3D8B3F',
  secondaryBackground: '#E8F5E9',

  // Background Colors
  background: '#F5F5F5',
  backgroundLight: '#FAFAFA',
  backgroundDark: '#EEEEEE',

  // Card & Surface
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceLight: '#FAFAFA',

  // Text Colors
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
    disabled: '#CCCCCC',
    inverse: '#FFFFFF',
  },

  // Status Colors
  error: '#FF3B30',
  errorLight: '#FF6B60',
  errorDark: '#D32F2F',
  errorBackground: '#FFEBEE',

  success: '#34C759',
  successLight: '#4CD964',
  successDark: '#28A745',
  successBackground: '#E8F5E9',

  warning: '#FFCC00',
  warningLight: '#FFD633',
  warningDark: '#F9A825',
  warningBackground: '#FFF9E6',

  info: '#007AFF',
  infoLight: '#339FFF',
  infoDark: '#0056B3',
  infoBackground: '#E3F2FD',

  // UI Colors
  border: '#E0E0E0',
  borderLight: '#EEEEEE',
  borderDark: '#CCCCCC',

  divider: '#F0F0F0',

  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Badge Colors
  badge: {
    bakery: '#FF6B35',
    cafe: '#8B4513',
    market: '#4CAF50',
    restaurant: '#FF3B30',
    default: '#666666',
  },

  // Special Colors
  discount: '#FF3B30',
  rating: '#FFB400',
  favorite: '#FF3B30',

  // Semantic Colors (mapped for clarity)
  active: '#FF6B35',
  inactive: '#CCCCCC',
  disabled: '#E0E0E0',

  // Shadow Colors
  shadow: '#000000',
};

export type ColorKey = keyof typeof colors;

export default colors;
