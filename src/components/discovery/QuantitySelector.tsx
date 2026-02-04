import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  min = 1,
  max = 99,
  onChange,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canDecrement && styles.buttonDisabled]}
        onPress={handleDecrement}
        disabled={!canDecrement}
      >
        <Text style={[styles.buttonText, !canDecrement && styles.buttonTextDisabled]}>
          −
        </Text>
      </TouchableOpacity>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, !canIncrement && styles.buttonDisabled]}
        onPress={handleIncrement}
        disabled={!canIncrement}
      >
        <Text style={[styles.buttonText, !canIncrement && styles.buttonTextDisabled]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    borderRadius: spacing.radiusLg,
    padding: spacing.xs,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundDark,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  buttonTextDisabled: {
    color: colors.text.tertiary,
  },
  valueContainer: {
    minWidth: 48,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
});

export default QuantitySelector;
