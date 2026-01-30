import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Product } from '../../domain/Product';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

/**
 * ProductCard - Matches Stitch Design
 *
 * Features:
 * - Large product image with overlays
 * - Category badge (top left)
 * - Discount badge (top right)
 * - Pickup time badge (bottom right on image)
 * - Store info with distance
 * - Prominent pricing
 * - Orange "Add" button
 */
const ProductCard = ({ product, onPress }: ProductCardProps) => {
  const getCategoryIcon = () => {
    const category = product.category?.toLowerCase() || '';
    if (category.includes('bakery')) return '🥖';
    if (category.includes('cafe')) return '☕';
    if (category.includes('grocery')) return '🛒';
    return '🍽️';
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      {/* Product Image with Overlays */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0]?.url || product.images[0]?.thumbnailUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Category Badge - Top Left */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
          <Text style={styles.categoryText}>
            {product.category || 'Food'}
          </Text>
        </View>

        {/* Discount Badge - Top Right */}
        {product.discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discountPercent}%</Text>
          </View>
        )}

        {/* Pickup Time Badge - Bottom Right */}
        <View style={styles.pickupBadge}>
          <Text style={styles.pickupIcon}>🕐</Text>
          <Text style={styles.pickupText}>
            Pickup: {product.pickupWindow.label.split(':')[0]}
          </Text>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>

            {/* Store Info Row */}
            <View style={styles.storeRow}>
              <Text style={styles.storeName} numberOfLines={1}>
                {product.store.name}
              </Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.distance}>
                {product.distance ? `${product.distance.toFixed(1)} km` : '0.5 km'}
              </Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.timeAgo}>2 minutes ago</Text>
            </View>
          </View>
        </View>

        {/* Price and Add Button Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.discountedPrice}>
              ${product.discountedPrice.toFixed(2)}
            </Text>
            <Text style={styles.originalPrice}>
              ${product.originalPrice.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={(e) => {
              e.stopPropagation();
              onPress();
            }}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  pickupBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pickupIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  pickupText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  infoContainer: {
    padding: 16,
  },
  titleRow: {
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  storeName: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  separator: {
    fontSize: 13,
    color: '#ccc',
    marginHorizontal: 6,
  },
  distance: {
    fontSize: 13,
    color: '#666',
  },
  timeAgo: {
    fontSize: 13,
    color: '#999',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  discountedPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ProductCard;
