import React from 'react';
import { Switch, View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: colors.backgroundDark,
          true: colors.primary,
        }}
        thumbColor={colors.card}
        ios_backgroundColor={colors.backgroundDark}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
});

export default Toggle;
