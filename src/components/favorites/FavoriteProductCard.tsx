import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../domain/Product';
import { ProductStatus } from '../../domain/enums/ProductStatus';

interface FavoriteProductCardProps {
  product: Product;
  onPress: () => void;
  onRemove: () => void;
  onReserve: () => void;
}

const FavoriteProductCard = ({ product, onPress, onRemove, onReserve }: FavoriteProductCardProps) => {
  const isActive = product.status === ProductStatus.ACTIVE;
  const isSoldOut = product.status === ProductStatus.SOLD_OUT || product.quantityAvailable <= 0;
  const isLowStock = isActive && product.quantityAvailable > 0 && product.quantityAvailable <= 3;

  const getActionButton = () => {
    if (isSoldOut) {
      return (
        <View style={[styles.badge, styles.badgeSoldOut]}>
          <Text style={styles.badgeSoldOutText}>Sold Out</Text>
        </View>
      );
    }
    if (product.status === ProductStatus.EXPIRED || product.status === ProductStatus.DEACTIVATED) {
      return (
        <View style={[styles.badge, styles.badgeClosed]}>
          <Text style={styles.badgeClosedText}>Closed</Text>
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={styles.reserveButton}
        onPress={(e) => {
          e.stopPropagation();
          onReserve();
        }}
      >
        <Text style={styles.reserveButtonText}>Reserve</Text>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images?.[0]?.url || product.images?.[0]?.thumbnailUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        {isLowStock && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Low Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color="#999" />
          </TouchableOpacity>
        </View>
        <Text style={styles.storeName} numberOfLines={1}>{product.store?.name}</Text>
        <View style={styles.bottomRow}>
          <Text style={styles.price}>${product.discountedPrice?.toFixed(2)}</Text>
          {getActionButton()}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  lowStockBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lowStockText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'space-between',
    height: 90,
    paddingVertical: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  moreButton: {
    padding: 2,
  },
  storeName: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ff7a33',
  },
  reserveButton: {
    backgroundColor: '#ff7a33',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },
  reserveButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeSoldOut: {
    backgroundColor: '#FFF0ED',
  },
  badgeSoldOutText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
  },
  badgeClosed: {
    backgroundColor: '#F0F0F0',
  },
  badgeClosedText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default FavoriteProductCard;
