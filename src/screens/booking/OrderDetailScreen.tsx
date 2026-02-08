import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, TouchableOpacity, Image, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';

import { OrdersStackParamList } from '../../navigation/OrdersNavigator';
import { useBookingDetail } from '../../hooks/useBookingDetail';
import { BookingStatus } from '../../domain/Booking';

type OrderDetailProps = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>;
type OrderDetailRouteProp = OrderDetailProps['route'];

const OrderDetailScreen = () => {
    const route = useRoute<OrderDetailRouteProp>();
    const navigation = useNavigation();
    const { bookingId } = route.params;
    const { booking, isLoading, isError, refetch } = useBookingDetail(bookingId);

    const openMaps = () => {
        if (!booking) return;
        const { lat, lng } = booking.store.location;
        const scheme = 'maps:0,0?q=';
        const latLng = `${lat},${lng}`;
        const label = booking.store.name;
        const url = `${scheme}${label}@${latLng}`;
        Linking.openURL(url);
    }

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#FF7A00" /></View>;
    }

    if (isError || !booking) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Could not load the order details.</Text>
                <Button title="Try Again" onPress={() => refetch()} color="#FF7A00" />
            </View>
        );
    }

    return (
        <View style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Confirmation</Text>
                </View>

                <View style={styles.confirmationContainer}>
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark-sharp" size={32} color="#FF7A00" />
                    </View>
                    <Text style={styles.woohooText}>Woohoo! It's yours.</Text>
                    <Text style={styles.subText}>
                        Show this code to the staff at{' '}
                        <Text style={{ fontWeight: 'bold' }}>{booking.store.name}</Text> to pick up your bag.
                    </Text>
                </View>

                <View style={styles.qrCard}>
                    <Text style={styles.scanText}>SCAN AT PICKUP</Text>
                    <View style={styles.qrContainer}>
                        {booking.qrCodeData ? (
                            <QRCode
                                value={booking.qrCodeData}
                                size={150}
                                backgroundColor='transparent'
                            />
                        ) : null}
                    </View>
                    <Text style={styles.orderNumber}>{booking.orderNumber}</Text>
                    <Text style={styles.paidStatus}>
                        <Ionicons name="checkmark-circle" size={14} color="#4CAF50" /> Paid & Confirmed
                    </Text>
                </View>

                <View style={styles.pickupCard}>
                    <Ionicons name="time-outline" size={24} color="#FF7A00" style={{ marginRight: 12 }} />
                    <View>
                        <Text style={styles.cardTitle}>PICKUP WINDOW</Text>
                        <Text style={styles.pickupTime}>{booking.pickupWindow.label}</Text>
                    </View>
                    <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>{booking.pickupWindow.dateLabel}</Text>
                    </View>
                </View>

                <View style={styles.storeCard}>
                    <Image source={{ uri: booking.product.imageUrl }} style={styles.storeImage} />
                    <View style={styles.storeInfo}>
                        <Text style={styles.storeName}><Ionicons name="business-outline" size={14} /> {booking.store.name}</Text>
                        <Text style={styles.storeAddress}>{booking.store.location.address}</Text>
                        <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
                            <Ionicons name="navigate-outline" size={20} color="white" />
                            <Text style={styles.directionsText}>Get Directions</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity onPress={() => { /* Contact Support */ }}>
                    <Text style={styles.supportText}>Having trouble? Contact Support</Text>
                </TouchableOpacity>

            </ScrollView>
            <View style={styles.footer}>
                {booking.status === BookingStatus.COMPLETED && !booking.isReviewed && (
                    <TouchableOpacity
                        style={styles.reviewButton}
                        onPress={() => {
                            (navigation.getParent()?.getParent() as any).navigate('AddReview', {
                                bookingId: booking.id,
                                productId: booking.product.id,
                                productName: booking.product.name,
                                productImage: booking.product.imageUrl,
                                storeName: booking.store.name,
                            });
                        }}
                    >
                        <Ionicons name="star-outline" size={20} color="#FF7A00" style={{ marginRight: 8 }} />
                        <Text style={styles.reviewButtonText}>Write a Review</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('MainApp' as never)}>
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FCFCFC' },
    container: { flex: 1 },
    contentContainer: { paddingBottom: 100 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FCFCFC' },
    errorText: { fontSize: 16, color: '#D32F2F', marginBottom: 10 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 20 },
    closeButton: { position: 'absolute', left: 16, top: 50, zIndex: 1 },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' },
    confirmationContainer: { alignItems: 'center', paddingHorizontal: 30, marginTop: 10 },
    checkCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF4E5', justifyContent: 'center', alignItems: 'center' },
    woohooText: { fontSize: 28, fontWeight: 'bold', marginTop: 20 },
    subText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 },
    qrCard: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    scanText: { fontSize: 12, color: '#AAA', fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
    qrContainer: { padding: 10, backgroundColor: 'white', borderRadius: 8, elevation: 2 },
    orderNumber: { fontSize: 22, fontWeight: 'bold', marginTop: 15 },
    paidStatus: { fontSize: 14, color: '#4CAF50', marginTop: 5 },
    pickupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, padding: 20, borderRadius: 16, elevation: 2 },
    cardTitle: { fontSize: 12, color: '#AAA', fontWeight: 'bold', letterSpacing: 1 },
    pickupTime: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 4 },
    todayBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 'auto' },
    todayText: { color: '#4CAF50', fontWeight: 'bold' },
    storeCard: { backgroundColor: 'white', margin: 20, borderRadius: 16, elevation: 2, overflow: 'hidden' },
    storeImage: { height: 120, width: '100%' },
    storeInfo: { padding: 20 },
    storeName: { fontSize: 18, fontWeight: 'bold' },
    storeAddress: { fontSize: 14, color: '#666', marginVertical: 8 },
    directionsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF7A00', paddingVertical: 14, borderRadius: 12, marginTop: 10 },
    directionsText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    supportText: { textAlign: 'center', color: '#888', marginVertical: 20 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FCFCFC', borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 12 },
    homeButton: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA' },
    homeButtonText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#333' },
    reviewButton: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FF7A00', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    reviewButtonText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#FF7A00' }
});

export default OrderDetailScreen;
