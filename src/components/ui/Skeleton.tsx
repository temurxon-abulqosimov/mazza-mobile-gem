import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = 20,
  style,
}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const getVariantStyle = () => {
    switch (variant) {
      case 'circular':
        return {
          width: typeof height === 'number' ? height : 40,
          height: typeof height === 'number' ? height : 40,
          borderRadius: 9999,
        };
      case 'text':
        return {
          height: 16,
          borderRadius: spacing.radiusXs,
        };
      case 'rectangular':
      default:
        return {
          borderRadius: spacing.radiusSm,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        getVariantStyle(),
        { width, height, opacity },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.backgroundDark,
  },
});

export default Skeleton;
