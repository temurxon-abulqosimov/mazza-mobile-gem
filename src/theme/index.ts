/**
 * Mazza App Theme
 * Central export for all theme values
 */

export { colors, type ColorKey } from './colors';
export { spacing, type SpacingKey } from './spacing';
export { typography, fontSizes, fontWeights, lineHeights, type TypographyKey } from './typography';
export { shadows, type ShadowKey } from './shadows';

// Import all for convenience
import colors from './colors';
import spacing from './spacing';
import typography from './typography';
import shadows from './shadows';

/**
 * Complete theme object
 * Use this for comprehensive theme access
 */
export const theme = {
  colors,
  spacing,
  typography,
  shadows,
};

export type Theme = typeof theme;

export default theme;
