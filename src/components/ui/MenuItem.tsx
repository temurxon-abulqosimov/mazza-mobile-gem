import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Icon from './Icon';
import { IconName } from '../../theme/icons';

interface MenuItemProps {
  icon: IconName;
  label: string;
  subtitle?: string;
  onPress: () => void;
  rightComponent?: React.ReactNode;
  badge?: number;
  style?: ViewStyle;
  showBorder?: boolean;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  subtitle,
  onPress,
  rightComponent,
  badge,
  style,
  showBorder = true,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, showBorder && styles.bordered, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={20} color={colors.text.primary} style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {rightComponent || <Text style={styles.arrow}>›</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md + 2,
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  icon: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: colors.text.primary,
    ...typography.body,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: colors.borderDark,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusFull,
    minWidth: 24,
    height: 24,
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MenuItem;
