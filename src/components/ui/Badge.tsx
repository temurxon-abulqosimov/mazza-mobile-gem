import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography, shadows } from '../../theme';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'bakery' | 'cafe' | 'market' | 'restaurant';
export type BadgeSize = 'small' | 'medium' | 'large';

interface BadgeProps {
  label: string;
  icon?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  icon,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}) => {
  const badgeStyles = [
    styles.badge,
    styles[`${variant}Badge`],
    styles[`${size}Badge`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={badgeStyles}>
      {icon && <Text style={[styles.icon, styles[`${size}Icon`]]}>{icon}</Text>}
      <Text style={textStyles}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.radiusSm,
    alignSelf: 'flex-start',
    ...shadows.badge,
  },
  text: {
    ...typography.label,
  },
  icon: {
    marginRight: spacing.xs,
  },

  // Variants
  primaryBadge: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.text.inverse,
  },

  secondaryBadge: {
    backgroundColor: colors.backgroundDark,
  },
  secondaryText: {
    color: colors.text.secondary,
  },

  successBadge: {
    backgroundColor: colors.success,
  },
  successText: {
    color: colors.text.inverse,
  },

  errorBadge: {
    backgroundColor: colors.error,
  },
  errorText: {
    color: colors.text.inverse,
  },

  warningBadge: {
    backgroundColor: colors.warning,
  },
  warningText: {
    color: colors.text.primary,
  },

  infoBadge: {
    backgroundColor: colors.info,
  },
  infoText: {
    color: colors.text.inverse,
  },

  // Business type badges
  bakeryBadge: {
    backgroundColor: colors.badge.bakery,
  },
  bakeryText: {
    color: colors.text.inverse,
  },

  cafeBadge: {
    backgroundColor: colors.badge.cafe,
  },
  cafeText: {
    color: colors.text.inverse,
  },

  marketBadge: {
    backgroundColor: colors.badge.market,
  },
  marketText: {
    color: colors.text.inverse,
  },

  restaurantBadge: {
    backgroundColor: colors.badge.restaurant,
  },
  restaurantText: {
    color: colors.text.inverse,
  },

  // Sizes
  smallBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  mediumBadge: {
    paddingVertical: spacing.badgePaddingVertical,
    paddingHorizontal: spacing.badgePaddingHorizontal,
  },
  largeBadge: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  // Text sizes
  smallText: {
    fontSize: 10,
    fontWeight: '600',
  },
  mediumText: {
    fontSize: 12,
    fontWeight: '600',
  },
  largeText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Icon sizes
  smallIcon: {
    fontSize: 10,
  },
  mediumIcon: {
    fontSize: 12,
  },
  largeIcon: {
    fontSize: 14,
  },
});

export default Badge;
