import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({
  title,
  children,
  backgroundColor = colors.card,
  style,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sectionMargin,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text.tertiary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
});

export default Section;
