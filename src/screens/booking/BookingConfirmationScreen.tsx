import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator';
import { Booking } from '../../domain/Booking';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';

type ConfirmationRouteProp = RouteProp<DiscoveryStackParamList, 'BookingConfirmation'>;
type ConfirmationNavigationProp = NativeStackNavigationProp<DiscoveryStackParamList, 'BookingConfirmation'>;

const BookingConfirmationScreen = () => {
  const { t } = useTranslation();
  const route = useRoute<ConfirmationRouteProp>();
  const navigation = useNavigation<ConfirmationNavigationProp>();
  const { booking } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t('orders.order_success')}</Text>
      <Text style={styles.subHeader}>{t('orders.order_confirmed_subtitle')}</Text>
      
      <View style={styles.qrContainer}>
        {booking.qrCodeData && (
          <QRCode
            value={booking.qrCodeData}
            size={250}
          />
        )}
      </View>

      <Text style={styles.orderNumber}>{booking.orderNumber}</Text>
      <Text style={styles.productName}>{booking.quantity}x {booking.product.name}</Text>
      
      <View style={styles.pickupSection}>
        <Text style={styles.sectionTitle}>{t('orders.pickup_at')}</Text>
        <Text style={styles.storeName}>{booking.store.name}</Text>
        <Text style={styles.storeAddress}>{booking.store.location.address}</Text>
        <Text style={styles.pickupWindow}>{booking.pickupWindow.dateLabel}, {booking.pickupWindow.label}</Text>
      </View>

      <Button title={t('orders.back_to_discover')} onPress={() => navigation.popToTop()} />
    </View>
  );
};

// ... add styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5'
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#4CAF50',
        marginBottom: 8,
    },
    subHeader: {
        fontSize: 18,
        color: '#666',
        marginBottom: 24,
    },
    qrContainer: {
        marginBottom: 24,
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    orderNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    productName: {
        fontSize: 14,
        color: '#333',
        marginBottom: 24,
    },
    pickupSection: {
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 16,
        marginBottom: 24,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    storeName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    storeAddress: {
        color: '#666',
    },
    pickupWindow: {
        marginTop: 4,
        color: '#337ab7',
        fontWeight: 'bold',
    }
});


export default BookingConfirmationScreen;
