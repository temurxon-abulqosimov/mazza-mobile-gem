import React from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { colors, spacing, typography, shadows } from '../../theme';
import { Badge } from '../ui/Badge';
import Icon from '../ui/Icon';
import { IconName } from '../../theme/icons';
import { ProductImage } from '../ui/ProductImage';

interface ProductPreview {
  id: string;
  images: { url: string; thumbnailUrl?: string }[];
  discountedPrice: number;
  category?: { slug: string };
}

interface Seller {
  id: string;
  name: string;
  imageUrl?: string;
  category: string;
  rating?: number;
  distance?: number;
  products?: ProductPreview[];
}

interface SellerCardProps {
  seller: Seller;
  onPress: () => void;
  onProductPress?: (productId: string) => void;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, onPress, onProductPress }) => {
  const getCategoryIcon = (): IconName => {
    const category = (typeof seller.category === 'string' ? seller.category : '').toLowerCase();
    if (category.includes('bakery')) return 'bread';
    if (category.includes('cafe')) return 'coffee';
    if (category.includes('grocery') || category.includes('market')) return 'cart';
    if (category.includes('restaurant')) return 'utensils';
    return 'store';
  };

  const productsToShow = seller.products?.slice(0, 3) || [];

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.mainContent}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri:
                seller.imageUrl ||
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
            }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {seller.name}
            </Text>
            <Badge
              label={seller.category}
              icon={getCategoryIcon()}
              size="small"
              variant="primary"
              style={styles.categoryBadge}
            />
          </View>

          <View style={styles.meta}>
            {!!seller.rating && (
              <>
                <Icon name="star-filled" size={12} color={colors.warning} style={styles.ratingIcon} />
                <Text style={styles.rating}>{seller.rating.toFixed(1)}</Text>
              </>
            )}
            {seller.distance !== undefined && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.distance}>
                  {seller.distance.toFixed(1)} km
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Product Thumbnails */}
      {productsToShow.length > 0 && (
        <View style={styles.productsContainer}>
          {productsToShow.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.productThumbnail}
              onPress={() => onProductPress && onProductPress(product.id)}
            >
              <ProductImage
                imageUrl={product.images[0]?.url || product.images[0]?.thumbnailUrl}
                categorySlug={product.category?.slug}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>${(product.discountedPrice / 100).toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280, // Wider card
    marginRight: spacing.md,
    backgroundColor: colors.card,
    borderRadius: spacing.radiusLg,
    ...shadows.card,
    overflow: 'hidden',
    padding: spacing.sm,
  },
  mainContent: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: spacing.radiusMd,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryBadge: {
    transform: [{ scale: 0.8 }], // Make slightly smaller
  },
  name: {
    ...typography.h4,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    marginRight: spacing.xxs,
  },
  rating: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginHorizontal: spacing.xs,
  },
  distance: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  productsContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  productThumbnail: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: spacing.radiusSm,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.background,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  priceTag: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderTopLeftRadius: 4,
  },
  priceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default SellerCard;
