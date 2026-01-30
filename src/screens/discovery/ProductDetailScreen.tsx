import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Button, Dimensions, Alert, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator';
import { useProduct } from '../../hooks/useProduct';
import { useBooking } from '../../hooks/useBooking';
import { useAuthGuard } from '../../hooks/useAuthGuard';

type ProductDetailRouteProp = RouteProp<DiscoveryStackParamList, 'ProductDetail'>;
type ProductDetailNavigationProp = NativeStackNavigationProp<DiscoveryStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRouteProp>();
  const navigation = useNavigation<ProductDetailNavigationProp>();
  const { productId } = route.params;

  const { product, isLoading, isError, refetch } = useProduct(productId);
  const { createBookingAsync, isCreatingBooking } = useBooking();
  const { requireAuth } = useAuthGuard();

  const [quantity, setQuantity] = useState(1);

  const handleBooking = async () => {
    // Check authentication before allowing reservation
    if (!requireAuth('Please login to reserve products and save meals!')) {
      return;
    }

    if (!product) return;

    try {
      const result = await createBookingAsync({
        productId: product.id,
        quantity,
        paymentMethodId: 'pm_mock_id', // This would come from a payment provider
      });
      navigation.navigate('BookingConfirmation', { booking: result.data.booking });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Could not create booking.';
      Alert.alert('Booking Failed', message);
    }
  };
  
  const canReserve = product && product.quantityAvailable > 0;

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (isError || !product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not load product details.</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Image source={{ uri: product.images[0]?.url }} style={styles.image} />
        <View style={styles.contentContainer}>
          <Text style={styles.name}>{product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.originalPrice}>${product.originalPrice.toFixed(2)}</Text>
            <Text style={styles.discountedPrice}>${product.discountedPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.badge}><Text style={styles.badgeText}>{product.discountPercent}% OFF</Text></View>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Window</Text>
            <Text>{product.pickupWindow.dateLabel}: {product.pickupWindow.label}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Store Information</Text>
            <Text style={styles.storeName}>{product.store.name}</Text>
            <Text>{product.store.location.address}</Text>
          </View>

          {canReserve && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.quantityButton}><Text>-</Text></TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(q => Math.min(product.quantityAvailable, q + 1))} style={styles.quantityButton}><Text>+</Text></TouchableOpacity>
              </View>
              <Text style={styles.quantityAvailableText}>{product.quantityAvailable} available</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        {isCreatingBooking ? (
            <ActivityIndicator />
        ) : (
            <Button title={canReserve ? "Reserve" : "Sold Out"} onPress={handleBooking} disabled={!canReserve} />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: width, height: width * 0.75 },
  contentContainer: { padding: 16 },
  name: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  originalPrice: { textDecorationLine: 'line-through', color: '#999', fontSize: 18, marginRight: 10 },
  discountedPrice: { fontSize: 22, fontWeight: 'bold', color: '#d9534f' },
  badge: { backgroundColor: 'red', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 16 },
  badgeText: { color: '#fff', fontWeight: 'bold' },
  description: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 16 },
  section: { marginBottom: 16, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  storeName: { fontSize: 16, fontWeight: '500' },
  quantitySelector: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  quantityButton: { paddingHorizontal: 20, paddingVertical: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  quantityText: { fontSize: 18, marginHorizontal: 20 },
  quantityAvailableText: { color: '#666', fontSize: 12 },
  footer: { padding: 16, borderTopWidth: 1, borderColor: '#eee', paddingBottom: 30 },
  errorText: { color: 'red' }
});

export default ProductDetailScreen;
