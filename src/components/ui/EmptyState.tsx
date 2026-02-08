import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';
import Icon from './Icon';
import { IconName } from '../../theme/icons';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  action,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Icon name={icon} size={64} color={colors.text.tertiary} style={styles.icon} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  icon: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    ...typography.h2,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
    ...typography.body,
  },
  button: {
    marginTop: spacing.lg,
  },
});

export default EmptyState;
