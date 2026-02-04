import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface ChipProps {
  label: string;
  icon?: string;
  active?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  active = false,
  onPress,
  style,
  textStyle,
}) => {
  const chipStyles = [
    styles.chip,
    active ? styles.activeChip : styles.inactiveChip,
    style,
  ];

  const textStyles = [
    styles.text,
    active ? styles.activeText : styles.inactiveText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={chipStyles}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={textStyles}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.chipPaddingVertical,
    paddingHorizontal: spacing.chipPaddingHorizontal,
    borderRadius: spacing.radiusXl,
    marginRight: spacing.sm,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  icon: {
    fontSize: 14,
    marginRight: spacing.sm,
  },

  // Active state
  activeChip: {
    backgroundColor: colors.primary,
  },
  activeText: {
    color: colors.text.inverse,
  },

  // Inactive state
  inactiveChip: {
    backgroundColor: colors.backgroundDark,
  },
  inactiveText: {
    color: colors.text.primary,
  },
});

export default Chip;
