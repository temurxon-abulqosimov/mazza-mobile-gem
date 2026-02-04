import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  RefreshControl,
  RefreshControlProps,
} from 'react-native';
import { colors, spacing } from '../../theme';

interface ScreenProps {
  children: React.ReactNode;
  backgroundColor?: string;
  padding?: number;
  scrollable?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  backgroundColor = colors.background,
  padding = spacing.lg,
  scrollable = true,
  refreshControl,
  style,
  contentContainerStyle,
}) => {
  const containerStyle = [
    styles.container,
    { backgroundColor },
    style,
  ];

  const contentStyle = [
    scrollable && styles.scrollContent,
    { padding },
    contentContainerStyle,
  ];

  if (scrollable) {
    return (
      <ScrollView
        style={containerStyle}
        contentContainerStyle={contentStyle}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={containerStyle}>
      <View style={contentStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default Screen;
