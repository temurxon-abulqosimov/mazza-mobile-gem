import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator';
import { useProduct } from '../../hooks/useProduct';
import { useBooking } from '../../hooks/useBooking';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { favoriteApi } from '../../api';
import { useQueryClient } from '@tanstack/react-query';
import { ImageGallery } from '../../components/discovery/ImageGallery';
import { QuantitySelector } from '../../components/discovery/QuantitySelector';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, spacing, typography, shadows } from '../../theme';
import Icon from '../../components/ui/Icon';
import { IconName } from '../../theme/icons';
import { getCategoryImage } from '../../theme/images';

type ProductDetailRouteProp = RouteProp<DiscoveryStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<DiscoveryStackParamList, 'ProductDetail'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const { t } = useTranslation();
  const { productId } = route.params;

  const { product, isLoading, isError, refetch } = useProduct(productId);
  const { createBookingAsync, isCreatingBooking } = useBooking();
  const { requireAuth } = useAuthGuard();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Sync isFavorite with product data
  useEffect(() => {
    if (product?.isFavorited !== undefined) {
      setIsFavorite(product.isFavorited);
    }
  }, [product?.isFavorited]);

  const handleBooking = async () => {
    if (!requireAuth(t('product_detail.login_to_reserve'))) {
      return;
    }

    if (!product) return;

    try {
      const result = await createBookingAsync({
        productId: product.id,
        quantity,
        paymentMethodId: '123e4567-e89b-12d3-a456-426614174000',
      });
      navigation.navigate('BookingConfirmation', { booking: result.data.booking });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Could not create booking.';
      Alert.alert(t('product_detail.booking_failed'), message);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!requireAuth(t('product_detail.login_to_save'))) {
      return;
    }

    const newState = !isFavorite;
    setIsFavorite(newState); // Optimistic update

    try {
      if (newState) {
        await favoriteApi.addFavoriteProduct(productId);
      } else {
        await favoriteApi.removeFavoriteProduct(productId);
      }
      // Invalidate related queries so favorites screen updates
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['discovery'] });
    } catch (e) {
      setIsFavorite(!newState); // Revert on error
      console.error('Failed to toggle favorite', e);
      Alert.alert('Error', 'Could not update favorites. Please try again.');
    }
  };

  const handleOpenMaps = () => {
    if (!product?.store?.location) return;

    const { lat, lng, address } = product.store.location;
    const label = encodeURIComponent(product.store.name);

    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });

    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch(err => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Could not open maps application.');
      });
    }
  };

  const getCategoryIcon = (): IconName => {
    const category = product?.category?.name?.toLowerCase() || '';
    if (category.includes('bakery')) return 'bread';
    if (category.includes('cafe')) return 'coffee';
    if (category.includes('grocery') || category.includes('market')) return 'cart';
    if (category.includes('restaurant')) return 'utensils';
    return 'store';
  };

  if (isLoading) {
    return <LoadingScreen message={t('product_detail.loading')} />;
  }

  if (isError || !product) {
    return (
      <EmptyState
        icon="alert-circle"
        title={t('product_detail.error_title')}
        subtitle={t('product_detail.error_subtitle')}
        action={{
          label: t('common.retry'),
          onPress: () => refetch(),
        }}
      />
    );
  }

  const canReserve = product.quantityAvailable > 0;
  const totalPrice = (product.discountedPrice / 100) * quantity;
  const totalSavings = ((product.originalPrice - product.discountedPrice) / 100) * quantity;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* Image Gallery */}
        <ImageGallery
          images={product.images.length > 0 ? product.images : [{ source: getCategoryImage(product.category?.slug) }]}
          categorySlug={product.category?.slug}
          onBack={() => navigation.goBack()}
          onFavorite={handleFavoriteToggle}
          isFavorite={isFavorite}
        />

        {/* Content card that overlaps the image */}
        <View style={styles.contentCard}>
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {product.discountPercent > 0 && (
              <Badge
                label={`${product.discountPercent}% OFF`}
                variant="error"
                size="medium"
                style={styles.badgeMargin}
              />
            )}
            <Badge
              label={product.category?.name || 'Food'}
              icon={getCategoryIcon()}
              variant="primary"
              size="medium"
            />
          </View>

          {/* Store Info */}
          <TouchableOpacity
            style={styles.storeRow}
            onPress={() => navigation.navigate('StoreProfile', {
              storeId: product.store.id,
              storeName: product.store.name,
              storeImage: product.store.imageUrl,
              storeAddress: product.store.location?.address,
              storeRating: product.store.rating,
            })}
            activeOpacity={0.7}
          >
            <View style={styles.storeAvatarCircle}>
              <Ionicons name="business" size={16} color={colors.primary} />
            </View>
            <View style={styles.storeTextGroup}>
              <Text style={styles.storeName}>{product.store.name}</Text>
              <View style={styles.storeMetaRow}>
                <Ionicons name="location" size={12} color={colors.text.tertiary} />
                <Text style={styles.storeDistance}>
                  {t('product_detail.km_away', { distance: product.distance ? product.distance.toFixed(1) : '0.5' })}
                </Text>
                {product.store.rating > 0 && (
                  <>
                    <Text style={styles.storeDot}>•</Text>
                    <Ionicons name="star" size={12} color="#FFB800" />
                    <Text style={styles.storeRating}>{product.store.rating.toFixed(1)}</Text>
                  </>
                )}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>

          {/* Product Title */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Description */}
          {product.description ? (
            <Text style={styles.description}>{product.description}</Text>
          ) : null}

          {/* Info Cards Row */}
          <View style={styles.infoCardsRow}>
            <View style={[styles.infoCardCompact, { flex: 1, marginRight: 8 }]}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="time-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.infoLabelCompact}>{t('product_detail.pickup_time')}</Text>
              <Text style={styles.infoValueCompact}>
                {product.pickupWindow.label}
              </Text>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>{product.pickupWindow.dateLabel}</Text>
              </View>
            </View>

            <View style={[styles.infoCardCompact, { flex: 1, marginLeft: 8 }]}>
              <View style={styles.infoIconCircle}>
                <Ionicons name="cube-outline" size={20} color={colors.primary} />
              </View>
              <Text style={styles.infoLabelCompact}>{t('product_detail.available')}</Text>
              <Text style={styles.infoValueCompact}>
                {product.quantityAvailable}
              </Text>
              <View style={[styles.infoBadge, product.quantityAvailable <= 2 && styles.infoBadgeUrgent]}>
                <Text style={[styles.infoBadgeText, product.quantityAvailable <= 2 && styles.infoBadgeTextUrgent]}>
                  {product.quantityAvailable <= 2 ? t('product_detail.selling_fast') : t('product_detail.in_stock')}
                </Text>
              </View>
            </View>
          </View>

          {/* Store Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product_detail.store_location')}</Text>
            <TouchableOpacity
              style={styles.mapContainer}
              onPress={handleOpenMaps}
              activeOpacity={0.9}
            >
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: product.store.location.lat,
                  longitude: product.store.location.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: product.store.location.lat,
                    longitude: product.store.location.lng,
                  }}
                  title={product.store.name}
                />
              </MapView>
              <View style={styles.mapOverlay}>
                <Ionicons name="navigate-outline" size={16} color={colors.primary} />
                <Text style={styles.openMapText}>{t('product_detail.open_in_maps')}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.locationCard}>
              <Ionicons name="location-outline" size={18} color={colors.primary} style={{ marginRight: 10 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationAddress}>{product.store.location.address}</Text>
                <Text style={styles.locationCity}>
                  {product.store.location.city}, {product.store.location.state} {product.store.location.zipCode}
                </Text>
              </View>
            </View>
          </View>

          {/* What You Get */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product_detail.what_you_get')}</Text>
            <View style={styles.whatYouGetCard}>
              <Text style={styles.sectionText}>
                {product.description || t('product_detail.default_description')}
              </Text>
            </View>
          </View>

          {/* Bottom spacing for fixed footer */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Section */}
      {canReserve && (
        <View style={styles.footer}>
          {/* Quantity Selector */}
          <View style={styles.footerTop}>
            <View>
              <Text style={styles.footerLabel}>{t('product_detail.quantity')}</Text>
              <QuantitySelector
                value={quantity}
                min={1}
                max={product.quantityAvailable}
                onChange={setQuantity}
              />
            </View>

            {/* Price Summary */}
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>{t('product_detail.total')}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.originalPrice}>${((product.originalPrice / 100) * quantity).toFixed(2)}</Text>
                <Text style={styles.discountedPrice}>${totalPrice.toFixed(2)}</Text>
              </View>
              <Text style={styles.savingsText}>{t('product_detail.you_save', { amount: totalSavings.toFixed(2) })}</Text>
            </View>
          </View>

          {/* Reserve Button */}
          <Button
            title={isCreatingBooking ? t('product_detail.reserving') : t('product_detail.reserve_now')}
            onPress={handleBooking}
            loading={isCreatingBooking}
            disabled={isCreatingBooking}
            fullWidth
            size="large"
          />
        </View>
      )}

      {/* Sold Out Footer */}
      {!canReserve && (
        <View style={styles.footer}>
          <Button
            title={t('product_detail.sold_out')}
            onPress={() => { }}
            disabled
            fullWidth
            size="large"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.massive,
  },

  // Content card overlapping image
  contentCard: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.background,
    paddingTop: 24,
    paddingHorizontal: spacing.lg,
  },

  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  badgeMargin: {
    marginRight: spacing.sm,
  },

  // Store row
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  storeAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeTextGroup: {
    flex: 1,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 3,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeDistance: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginLeft: 3,
  },
  storeDot: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginHorizontal: 6,
  },
  storeRating: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    marginLeft: 3,
  },

  productTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: 20,
  },

  // Info cards row (side by side)
  infoCardsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoCardCompact: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabelCompact: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValueCompact: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  infoBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  infoBadgeUrgent: {
    backgroundColor: '#FFF3E0',
  },
  infoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4CAF50',
  },
  infoBadgeTextUrgent: {
    color: '#FF7A00',
  },

  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionText: {
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  whatYouGetCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  mapContainer: {
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.radiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  openMapText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  locationCity: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  bottomSpacing: {
    height: spacing.xxxl,
  },
  footer: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    ...shadows.lg,
  },
  footerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  footerLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
    marginRight: spacing.sm,
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  savingsText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;
