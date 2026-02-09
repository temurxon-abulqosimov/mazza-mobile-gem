import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Product } from '../../domain/Product';
import { colors, spacing, typography } from '../../theme';
import { getCategoryImage } from '../../theme/images';
import { ProductImage } from '../ui/ProductImage';

interface SellerProductCardProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
  onPress: () => void;
}

const SellerProductCard = ({ product, onEdit, onDelete, onPress }: SellerProductCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return colors.success;
      case 'DRAFT':
        return colors.text.secondary;
      case 'SOLD_OUT':
        return colors.error;
      case 'EXPIRED':
        return colors.text.tertiary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Active';
      case 'DRAFT':
        return 'Draft';
      case 'SOLD_OUT':
        return 'Sold Out';
      case 'EXPIRED':
        return 'Expired';
      case 'DEACTIVATED':
        return 'Deactivated';
      default:
        return status;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      <View style={styles.contentRow}>
        {/* Product Image */}
        {product.images && product.images.length > 0 ? (
          <ProductImage
            imageUrl={product.images[0]?.url || product.images[0]?.thumbnailUrl}
            categorySlug={product.category?.slug}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderIcon}>📦</Text>
          </View>
        )}

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.name}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(product.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(product.status) }]}>
                {getStatusLabel(product.status)}
              </Text>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.priceRow}>
            <Text style={styles.discountedPrice}>
              ${(product.discountedPrice / 100).toFixed(2)}
            </Text>
            <Text style={styles.originalPrice}>
              ${(product.originalPrice / 100).toFixed(2)}
            </Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discountPercent}%</Text>
            </View>
          </View>

          {/* Quantity & Pickup Time */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              📦 {product.quantityAvailable}/{product.quantity} left
            </Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.metaText} numberOfLines={1}>
              🕐 {product.pickupWindow?.label || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: spacing.radiusLg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: spacing.radiusMd,
  },
  placeholderImage: {
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
  },
  infoContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  productName: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.radiusSm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  discountedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: spacing.sm,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
    marginRight: spacing.sm,
  },
  discountBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.radiusSm,
  },
  discountText: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: 'bold',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  separator: {
    fontSize: 12,
    color: colors.divider,
    marginHorizontal: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusMd,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  editButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  editButtonText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  deleteButton: {
    backgroundColor: `${colors.error}10`,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    ...typography.button,
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
});

export default SellerProductCard;
