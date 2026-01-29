import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Booking } from '../../domain/Booking';

interface OrderCardProps {
  booking: Booking;
  onPress: () => void;
}

const OrderCard = ({ booking, onPress }: OrderCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: booking.product.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.storeName}>{booking.store.name}</Text>
        <Text style={styles.productName}>{booking.quantity}x {booking.product.name}</Text>
        <Text style={styles.price}>Total: ${booking.totalPrice.toFixed(2)}</Text>
        <Text style={styles.date}>
          Booked on {new Date(booking.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
            <Text style={styles.statusText}>{booking.statusLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'CONFIRMED':
        case 'READY_FOR_PICKUP':
            return '#4CAF50'; // Green
        case 'COMPLETED':
            return '#337ab7'; // Blue
        case 'CANCELLED':
        case 'EXPIRED':
            return '#d9534f'; // Red
        default:
            return '#777'; // Gray
    }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  productName: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  price: {
      fontSize: 14,
      fontWeight: '500',
  },
  date: {
      fontSize: 12,
      color: '#999',
      marginTop: 4,
  },
  statusContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 10,
  },
  statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default OrderCard;
