/**
 * Mazza App Typography System
 * Font sizes, weights, and line heights
 */

import { TextStyle } from 'react-native';

export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};

export const fontSizes = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 28,
  massive: 32,
};

export const lineHeights = {
  xs: 14,
  sm: 16,
  md: 18,
  base: 20,
  lg: 22,
  xl: 24,
  xxl: 28,
  xxxl: 32,
  huge: 36,
  massive: 40,
};

export const typography = {
  // Heading styles
  h1: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xxxl,
  },
  h2: {
    fontSize: fontSizes.xxl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xxl,
  },
  h3: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.xl,
  },
  h4: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.lg,
  },

  // Body styles
  body: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.base,
  },
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.lg,
  },
  bodySmall: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.md,
  },

  // Caption styles
  caption: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.sm,
  },
  captionBold: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.sm,
  },

  // Small text
  small: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.xs,
  },
  smallBold: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.xs,
  },

  // Button text
  button: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.base,
  },
  buttonLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.lg,
  },
  buttonSmall: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.md,
  },

  // Link text
  link: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.base,
  },

  // Label text
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.md,
  },
  labelBold: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.md,
  },

  // Price text
  priceMain: {
    fontSize: fontSizes.xxxl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xxxl,
  },
  priceOriginal: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: lineHeights.base,
  },

  // Section title
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.sm,
    letterSpacing: 1,
  },

  // Product card title
  productTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.xl,
  },
};

export type TypographyKey = keyof typeof typography;

export default typography;
