import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StatusBar,
  Platform,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  rightAction?: React.ReactNode;
  leftAction?: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  rightAction,
  leftAction,
  backgroundColor = colors.card,
  style,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      <View style={styles.content}>
        {/* Left side */}
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          {leftAction}
        </View>

        {/* Center (title) */}
        {title && (
          <View style={styles.center}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        )}

        {/* Right side */}
        <View style={styles.right}>{rightAction}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? (StatusBar.currentHeight || 44) : 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
    justifyContent: 'flex-end',
  },
  backButton: {
    padding: spacing.sm,
    marginLeft: -spacing.sm,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  title: {
    ...typography.h3,
    color: colors.text.primary,
  },
});

export default Header;
