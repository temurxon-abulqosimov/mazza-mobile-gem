import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

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
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.text} numberOfLines={1}>
        {location}
      </Text>
      <Text style={styles.arrow}>▼</Text>
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
  arrow: {
    fontSize: 12,
    color: colors.text.secondary,
  },
});

export default LocationSelector;
