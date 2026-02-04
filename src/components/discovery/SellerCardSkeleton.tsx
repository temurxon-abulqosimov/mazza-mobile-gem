import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { colors, spacing, shadows } from '../../theme';

export const SellerCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Image skeleton */}
      <Skeleton variant="rectangular" width="100%" height={120} />

      {/* Info skeleton */}
      <View style={styles.info}>
        <Skeleton variant="text" width="80%" height={14} style={styles.nameSkeleton} />
        <Skeleton variant="text" width="60%" height={12} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginRight: spacing.md,
    backgroundColor: colors.card,
    borderRadius: spacing.radiusLg,
    ...shadows.card,
    overflow: 'hidden',
  },
  info: {
    padding: spacing.md,
  },
  nameSkeleton: {
    marginBottom: spacing.xs,
  },
});

export default SellerCardSkeleton;
