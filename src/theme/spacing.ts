/**
 * Mazza App Spacing System
 * Consistent spacing values based on 4px base unit
 */

export const spacing = {
  // Base spacing units
  xxs: 2,   // 2px
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 20,   // 20px
  xxl: 24,  // 24px
  xxxl: 32, // 32px
  huge: 40, // 40px
  massive: 48, // 48px

  // Semantic spacing
  cardPadding: 16,
  screenPadding: 16,
  sectionMargin: 20,
  componentGap: 12,
  listItemGap: 16,

  // Icon sizes
  iconXs: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 40,
  iconXxl: 48,
  iconHuge: 56,

  // Avatar sizes
  avatarSm: 32,
  avatarMd: 48,
  avatarLg: 64,
  avatarXl: 80,
  avatarXxl: 100,

  // Border radius
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 20,
  radiusXxl: 24,
  radiusFull: 9999,

  // Touch targets
  minTouchTarget: 44, // iOS Human Interface Guidelines minimum
  touchTargetSm: 44,
  touchTargetMd: 48,
  touchTargetLg: 56,

  // Specific component spacing
  buttonPaddingVertical: 12,
  buttonPaddingHorizontal: 24,
  inputPaddingVertical: 12,
  inputPaddingHorizontal: 16,
  chipPaddingVertical: 8,
  chipPaddingHorizontal: 16,
  badgePaddingVertical: 6,
  badgePaddingHorizontal: 10,
};

export type SpacingKey = keyof typeof spacing;

export default spacing;
