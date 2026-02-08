import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Icon from '../ui/Icon';

interface LocationSelectorProps {
  location: string;
  onPress: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  location,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Icon name="location" size={16} color={colors.primary} style={styles.icon} />
      <Text style={styles.text} numberOfLines={1}>
        {location}
      </Text>
      <Icon name="chevron-down" size={12} color={colors.text.secondary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  icon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    ...typography.h4,
  },
});

export default LocationSelector;
