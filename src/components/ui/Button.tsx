import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, spacing, typography, shadows } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && styles[`${variant}Disabled`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.text.inverse : colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.radiusSm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.button,
    textAlign: 'center',
  },

  // Primary button
  primaryButton: {
    backgroundColor: colors.primary,
    ...shadows.buttonPrimary,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  primaryDisabled: {
    backgroundColor: colors.primaryLight,
    opacity: 0.6,
  },

  // Secondary button
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.button,
  },
  secondaryText: {
    color: colors.text.primary,
  },
  secondaryDisabled: {
    backgroundColor: colors.backgroundDark,
    borderColor: colors.borderLight,
  },

  // Outline button
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },
  outlineDisabled: {
    borderColor: colors.borderDark,
  },

  // Text button
  textButton: {
    backgroundColor: 'transparent',
  },
  textText: {
    color: colors.primary,
  },
  textDisabled: {
    backgroundColor: 'transparent',
  },

  // Danger button
  dangerButton: {
    backgroundColor: colors.error,
    ...shadows.button,
  },
  dangerText: {
    color: colors.text.inverse,
  },
  dangerDisabled: {
    backgroundColor: colors.errorLight,
    opacity: 0.6,
  },

  // Sizes
  smallButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 36,
  },
  mediumButton: {
    paddingVertical: spacing.buttonPaddingVertical,
    paddingHorizontal: spacing.buttonPaddingHorizontal,
    minHeight: 44,
  },
  largeButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    minHeight: 52,
  },

  // Text sizes
  smallText: {
    ...typography.buttonSmall,
  },
  mediumText: {
    ...typography.button,
  },
  largeText: {
    ...typography.buttonLarge,
  },

  // States
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: colors.text.disabled,
  },

  // Full width
  fullWidth: {
    width: '100%',
  },

  // Icon spacing
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default Button;
