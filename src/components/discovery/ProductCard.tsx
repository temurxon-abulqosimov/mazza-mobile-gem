import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Product } from '../../../domain/Product';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
}

const ProductCard = ({ product, onPress }: ProductCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: product.images[0]?.thumbnailUrl }} style={styles.image} />
      {product.discountPercent > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{product.discountPercent}% OFF</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.storeName}>{product.store.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
          <Text style={styles.discountedPrice}>${product.discountedPrice.toFixed(2)}</Text>
        </View>
        <Text style={styles.pickupWindow}>{product.pickupWindow.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 150,
    },
    discountBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'red',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    discountText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    infoContainer: {
        padding: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    storeName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: '#999',
        marginRight: 8,
    },
    discountedPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d9534f',
    },
    pickupWindow: {
        fontSize: 12,
        color: '#337ab7',
    },
});


export default ProductCard;
