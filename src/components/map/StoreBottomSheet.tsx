import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Store } from '../../domain/Store';
import { colors, spacing, typography, shadows } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.35;

interface StoreBottomSheetProps {
  store: Store | null;
  onClose: () => void;
  onViewStore: (storeId: string) => void;
}

export const StoreBottomSheet: React.FC<StoreBottomSheetProps> = ({
  store,
  onClose,
  onViewStore,
}) => {
  if (!store) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Bottom Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Store Image */}
          <Image
            source={{ uri: store.imageUrl || 'https://via.placeholder.com/400' }}
            style={styles.storeImage}
          />

          {/* Store Info */}
          <View style={styles.infoSection}>
            <Text style={styles.storeName}>{store.name}</Text>

            {/* Rating & Distance */}
            <View style={styles.metaRow}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>{store.rating.toFixed(1)}</Text>
                {store.reviewCount && (
                  <Text style={styles.reviewCount}>({store.reviewCount})</Text>
                )}
              </View>
              {store.distance !== undefined && (
                <View style={styles.distanceContainer}>
                  <Text style={styles.distanceIcon}>📍</Text>
                  <Text style={styles.distanceText}>
                    {store.distance.toFixed(1)} km away
                  </Text>
                </View>
              )}
            </View>

            {/* Address */}
            <View style={styles.addressSection}>
              <Text style={styles.addressIcon}>📍</Text>
              <View style={styles.addressContent}>
                <Text style={styles.addressText}>{store.location.address}</Text>
                {store.location.city && (
                  <Text style={styles.cityText}>{store.location.city}</Text>
                )}
              </View>
            </View>

            {/* Description */}
            {store.description && (
              <Text style={styles.description} numberOfLines={2}>
                {store.description}
              </Text>
            )}

            {/* View Store Button */}
            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => onViewStore(store.id)}
            >
              <Text style={styles.viewButtonText}>View Available Items</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: colors.card,
    borderTopLeftRadius: spacing.radiusXl,
    borderTopRightRadius: spacing.radiusXl,
    ...shadows.xl,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.divider,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  storeImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  infoSection: {
    padding: spacing.lg,
  },
  storeName: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  ratingIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceIcon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  distanceText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  addressSection: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundDark,
    borderRadius: spacing.radiusMd,
  },
  addressIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  addressContent: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  cityText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    ...shadows.sm,
  },
  viewButtonText: {
    ...typography.button,
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StoreBottomSheet;
