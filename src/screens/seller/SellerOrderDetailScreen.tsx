
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography, shadows } from '../../theme';
import { Button } from '../../components/ui/Button';
import { useCompleteOrder } from '../../hooks/useCompleteOrder';
import { LiveOrder } from '../../api/seller';

// Define params type manually if valid type import is circular or tricky
type SellerOrderDetailParams = {
    order: LiveOrder;
};

const SellerOrderDetailScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: SellerOrderDetailParams }, 'params'>>();
    const { order } = route.params;
    const { completeOrderAsync, isCompleting } = useCompleteOrder();

    const handleCompleteOrder = () => {
        Alert.alert(
            t('seller_order_detail.complete_order'),
            t('seller_order_detail.complete_confirm_msg'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('seller_order_detail.complete'),
                    onPress: async () => {
                        // Generate manual QR string for completion
                        // Format: MAZZA:ORDER_NUMBER:BOOKING_ID
                        const orderNum = order.orderNumber.replace('#', '');
                        const manualQrData = `MAZZA:${orderNum}:${order.id}`;

                        try {
                            await completeOrderAsync({ orderId: order.id, qrCodeData: manualQrData });
                            Alert.alert(t('common.success'), t('seller_order_detail.order_completed'));
                            navigation.goBack();
                        } catch (error: any) {
                            const msg = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Failed to complete order';
                            Alert.alert(t('common.error'), msg);
                        }
                    },
                },
            ]
        );
    };

    const handleScanQr = () => {
        // In a real app, navigate to a QR scanner screen
        // For now, shortcut to completion logic or mock the scan result
        Alert.alert(t('seller_order_detail.scan_qr_title'), t('seller_order_detail.scan_mock_msg'), [
            {
                text: t('seller_order_detail.simulate_success'),
                onPress: async () => {
                    const orderNum = order.orderNumber.replace('#', '');
                    const mockQrData = `MAZZA:${orderNum}:${order.id}`;
                    try {
                        await completeOrderAsync({ orderId: order.id, qrCodeData: mockQrData });
                        Alert.alert(t('common.success'), t('seller_order_detail.order_completed'));
                        navigation.goBack();
                    } catch (error: any) {
                        const msg = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Failed to complete order';
                        Alert.alert(t('common.error'), msg);
                    }
                },
            },
            { text: t('common.cancel'), style: 'cancel' },
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('seller_order_detail.title')}</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView style={styles.content}>
                {/* Status Badge */}
                <View style={styles.statusSection}>
                    <View
                        style={[
                            styles.statusBadge,
                            order.payment.status === 'PAID' || order.payment.status === 'COMPLETED'
                                ? styles.statusBadgePaid
                                : styles.statusBadgePending,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusText,
                                order.payment.status === 'PAID' || order.payment.status === 'COMPLETED'
                                    ? styles.statusTextPaid
                                    : styles.statusTextPending,
                            ]}
                        >
                            {order.payment.status === 'COMPLETED'
                                ? t('seller_order_detail.completed')
                                : order.payment.status === 'PAID'
                                    ? t('seller_order_detail.ready_for_pickup')
                                    : t('seller_order_detail.pending_payment')}
                        </Text>
                    </View>
                    <Text style={styles.orderNumber}>{t('seller_order_detail.order_number', { number: order.orderNumber })}</Text>
                    <Text style={styles.date}>
                        {t('seller_order_detail.placed_on', {
                            date: new Date(order.createdAt).toLocaleDateString(),
                            time: new Date(order.createdAt).toLocaleTimeString(),
                        })}
                    </Text>
                </View>

                {/* Customer Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('seller_order_detail.customer')}</Text>
                    <View style={styles.customerRow}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>
                                {order.customer.fullName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.customerName}>{order.customer.fullName}</Text>
                            <Text style={styles.customerSubtitle}>{t('seller_order_detail.customer')}</Text>
                        </View>
                    </View>
                </View>

                {/* Order Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('seller_order_detail.items')}</Text>
                    <View style={styles.itemRow}>
                        <Image
                            source={{ uri: order.product.imageUrl || 'https://via.placeholder.com/64' }}
                            style={styles.productImage}
                        />
                        <View style={styles.itemDetails}>
                            <Text style={styles.productName}>{order.product.name}</Text>
                            <Text style={styles.quantity}>{t('seller_order_detail.quantity_x', { quantity: order.quantity })}</Text>
                            <Text style={styles.price}>
                                ${(order.totalPrice / 100).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>{t('seller_order_detail.total')}</Text>
                        <Text style={styles.totalValue}>${(order.totalPrice / 100).toFixed(2)}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionContainer}>
                    <Text style={styles.actionHint}>
                        {t('seller_order_detail.scan_hint')}
                    </Text>
                    <Button
                        title={t('seller_order_detail.scan_qr')}
                        onPress={handleScanQr}
                        size="large"
                        disabled={isCompleting || order.status === 'COMPLETED'}
                    />
                    {order.status !== 'COMPLETED' && (
                        <TouchableOpacity
                            style={styles.manualButton}
                            onPress={handleCompleteOrder}
                            disabled={isCompleting}
                        >
                            <Text style={styles.manualButtonText}>
                                {isCompleting ? t('seller_order_detail.completing') : t('seller_order_detail.manually_complete')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.card,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: 8,
    },
    backIcon: {
        fontSize: 24,
        color: colors.text.primary,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    statusSection: {
        alignItems: 'center',
        marginBottom: 24,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    statusBadgePaid: {
        backgroundColor: '#dcfce7',
    },
    statusBadgePending: {
        backgroundColor: '#f3f4f6',
    },
    statusText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusTextPaid: {
        color: colors.success,
    },
    statusTextPending: {
        color: colors.text.secondary,
    },
    orderNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        ...shadows.sm,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 12,
    },
    customerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    customerName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
    },
    customerSubtitle: {
        fontSize: 14,
        color: colors.text.secondary,
    },
    itemRow: {
        flexDirection: 'row',
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    productImage: {
        width: 64,
        height: 64,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text.primary,
        marginBottom: 4,
    },
    quantity: {
        fontSize: 14,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    actionContainer: {
        marginTop: 8,
        marginBottom: 40,
    },
    actionHint: {
        fontSize: 14,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: 16,
    },
    manualButton: {
        marginTop: 16,
        alignItems: 'center',
        padding: 12,
    },
    manualButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SellerOrderDetailScreen;
