import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '../ui/Skeleton';
import { colors, spacing, shadows } from '../../theme';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Image skeleton */}
      <Skeleton variant="rectangular" width="100%" height={200} />

      {/* Info skeleton */}
      <View style={styles.info}>
        {/* Title */}
        <Skeleton variant="text" width="80%" height={20} style={styles.titleSkeleton} />

        {/* Store info */}
        <Skeleton variant="text" width="60%" height={14} style={styles.storeSkeleton} />

        {/* Price row */}
        <View style={styles.priceRow}>
          <Skeleton variant="text" width={80} height={28} />
          <Skeleton variant="rectangular" width={60} height={36} style={styles.buttonSkeleton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusLg,
    marginBottom: spacing.lg,
    ...shadows.card,
    overflow: 'hidden',
  },
  info: {
    padding: spacing.lg,
  },
  titleSkeleton: {
    marginBottom: spacing.sm,
  },
  storeSkeleton: {
    marginBottom: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonSkeleton: {
    borderRadius: spacing.radiusXl,
  },
});

export default ProductCardSkeleton;
