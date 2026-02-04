import React from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, spacing, typography, shadows } from '../../theme';
import { Badge } from '../ui/Badge';

interface Seller {
  id: string;
  name: string;
  imageUrl?: string;
  category: string;
  rating?: number;
  distance?: number;
}

interface SellerCardProps {
  seller: Seller;
  onPress: () => void;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, onPress }) => {
  const getCategoryIcon = () => {
    const category = (typeof seller.category === 'string' ? seller.category : '').toLowerCase();
    if (category.includes('bakery')) return '🥖';
    if (category.includes('cafe')) return '☕';
    if (category.includes('grocery') || category.includes('market')) return '🛒';
    if (category.includes('restaurant')) return '🍽️';
    return '🏪';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.95}
    >
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
        {/* Category Badge */}
        <View style={styles.badgeContainer}>
          <Badge
            label={seller.category}
            icon={getCategoryIcon()}
            size="small"
            variant="primary"
          />
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {seller.name}
        </Text>
        <View style={styles.meta}>
          {seller.rating && (
            <>
              <Text style={styles.ratingIcon}>⭐</Text>
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
    </TouchableOpacity>
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
  imageContainer: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
  },
  info: {
    padding: spacing.md,
  },
  name: {
    ...typography.h4,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingIcon: {
    fontSize: 12,
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
});

export default SellerCard;
