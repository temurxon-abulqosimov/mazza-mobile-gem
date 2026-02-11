import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Linking, Platform } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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

        {/* Badges on top of content */}
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

        {/* Content */}
        <View style={styles.content}>
          {/* Store Info */}
          <View style={styles.storeInfo}>
            <TouchableOpacity onPress={() => navigation.navigate('StoreProfile', {
              storeId: product.store.id,
              storeName: product.store.name,
              storeImage: product.store.imageUrl, // Assuming product.store has these
              storeAddress: product.store.location?.address,
              storeRating: product.store.rating,
            })}>
              <Text style={styles.storeName}>{product.store.name}</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="location-fill" size={12} color={colors.text.secondary} style={{ marginRight: 4 }} />
              <Text style={styles.storeDistance}>
                {t('product_detail.km_away', { distance: product.distance ? product.distance.toFixed(1) : '0.5' })}
              </Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Pickup Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="clock" size={24} color={colors.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('product_detail.pickup_time')}</Text>
                <Text style={styles.infoValue}>
                  {product.pickupWindow.dateLabel}: {product.pickupWindow.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Quantity Available */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Icon name="package" size={24} color={colors.primary} style={styles.infoIcon} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{t('product_detail.available')}</Text>
                <Text style={styles.infoValue}>
                  {product.quantityAvailable === 1 ? t('product_detail.item_left', { count: product.quantityAvailable }) : t('product_detail.items_left', { count: product.quantityAvailable })}
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
                <Icon name="location-fill" size={24} color={colors.primary} />
                <Text style={styles.openMapText}>{t('product_detail.open_in_maps')}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.locationCard}>
              <Text style={styles.locationAddress}>{product.store.location.address}</Text>
              <Text style={styles.locationCity}>
                {product.store.location.city}, {product.store.location.state} {product.store.location.zipCode}
              </Text>
            </View>
          </View>

          {/* What You Get */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('product_detail.what_you_get')}</Text>
            <Text style={styles.sectionText}>
              {product.description || t('product_detail.default_description')}
            </Text>
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
  badgesContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    flexWrap: 'wrap',
  },
  badgeMargin: {
    marginRight: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  storeInfo: {
    marginBottom: spacing.sm,
  },
  storeName: {
    ...typography.h4,
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xxs,
  },
  storeDistance: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  productTitle: {
    ...typography.h1,
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  description: {
    ...typography.body,
    fontSize: 15,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.text.tertiary,
    marginBottom: spacing.xxs,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
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
  mapContainer: {
    height: 200,
    borderRadius: spacing.radiusLg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative',
    ...shadows.sm,
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
    paddingVertical: spacing.xs,
    borderRadius: spacing.radiusFull,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  openMapText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  locationCard: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusLg,
    padding: spacing.lg,
    ...shadows.sm,
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
    paddingBottom: spacing.xl,
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
