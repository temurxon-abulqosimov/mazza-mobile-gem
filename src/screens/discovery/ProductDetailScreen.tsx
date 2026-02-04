import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator';
import { useProduct } from '../../hooks/useProduct';
import { useBooking } from '../../hooks/useBooking';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import { ImageGallery } from '../../components/discovery/ImageGallery';
import { QuantitySelector } from '../../components/discovery/QuantitySelector';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, spacing, typography, shadows } from '../../theme';

type ProductDetailRouteProp = RouteProp<DiscoveryStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<DiscoveryStackParamList, 'ProductDetail'>;

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const { productId } = route.params;

  const { product, isLoading, isError, refetch } = useProduct(productId);
  const { createBookingAsync, isCreatingBooking } = useBooking();
  const { requireAuth } = useAuthGuard();

  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleBooking = async () => {
    if (!requireAuth('Please login to reserve products and save meals!')) {
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
      Alert.alert('Booking Failed', message);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // TODO: Call API to save/remove favorite
  };

  const getCategoryIcon = () => {
    const category = product?.category?.name?.toLowerCase() || '';
    if (category.includes('bakery')) return '🥖';
    if (category.includes('cafe')) return '☕';
    if (category.includes('grocery') || category.includes('market')) return '🛒';
    if (category.includes('restaurant')) return '🍽️';
    return '🏪';
  };

  if (isLoading) {
    return <LoadingScreen message="Loading product details..." />;
  }

  if (isError || !product) {
    return (
      <EmptyState
        icon="⚠️"
        title="Could not load product"
        subtitle="Please check your connection and try again"
        action={{
          label: "Retry",
          onPress: () => refetch(),
        }}
      />
    );
  }

  const canReserve = product.quantityAvailable > 0;
  const totalPrice = product.discountedPrice * quantity;
  const totalSavings = (product.originalPrice - product.discountedPrice) * quantity;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Gallery */}
        <ImageGallery
          images={product.images.length > 0 ? product.images : [{ url: 'https://via.placeholder.com/400' }]}
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
            <Text style={styles.storeName}>{product.store.name}</Text>
            <Text style={styles.storeDistance}>
              📍 {product.distance ? `${product.distance.toFixed(1)} km` : '0.5 km away'}
            </Text>
          </View>

          {/* Product Title */}
          <Text style={styles.productTitle}>{product.name}</Text>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Pickup Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🕐</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Pickup Time</Text>
                <Text style={styles.infoValue}>
                  {product.pickupWindow.dateLabel}: {product.pickupWindow.label}
                </Text>
              </View>
            </View>
          </View>

          {/* Quantity Available */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📦</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Available</Text>
                <Text style={styles.infoValue}>
                  {product.quantityAvailable} {product.quantityAvailable === 1 ? 'item' : 'items'} left
                </Text>
              </View>
            </View>
          </View>

          {/* Store Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store Location</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationAddress}>{product.store.location.address}</Text>
              <Text style={styles.locationCity}>
                {product.store.location.city}, {product.store.location.state} {product.store.location.zipCode}
              </Text>
            </View>
          </View>

          {/* What You Get */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What You Get</Text>
            <Text style={styles.sectionText}>
              {product.description || 'A surprise selection of delicious surplus food items.'}
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
              <Text style={styles.footerLabel}>Quantity</Text>
              <QuantitySelector
                value={quantity}
                min={1}
                max={product.quantityAvailable}
                onChange={setQuantity}
              />
            </View>

            {/* Price Summary */}
            <View style={styles.priceSection}>
              <Text style={styles.priceLabel}>Total</Text>
              <View style={styles.priceRow}>
                <Text style={styles.originalPrice}>${(product.originalPrice * quantity).toFixed(2)}</Text>
                <Text style={styles.discountedPrice}>${totalPrice.toFixed(2)}</Text>
              </View>
              <Text style={styles.savingsText}>You save ${totalSavings.toFixed(2)}</Text>
            </View>
          </View>

          {/* Reserve Button */}
          <Button
            title={isCreatingBooking ? 'Reserving...' : 'Reserve Now'}
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
            title="Sold Out"
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
    fontSize: 24,
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
