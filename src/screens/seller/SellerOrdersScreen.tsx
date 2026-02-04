import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLiveOrders } from '../../hooks/useLiveOrders';
import { colors, spacing, typography } from '../../theme';

const SellerOrdersScreen = () => {
  const navigation = useNavigation<any>();
  const { orders, isLoading, refetch } = useLiveOrders();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {isLoading && !refreshing && orders.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>
              Orders from customers will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('SellerOrderDetail', { order })}
              >
                <View
                  style={[
                    styles.orderBorder,
                    order.payment.status === 'PAID' || order.payment.status === 'COMPLETED'
                      ? styles.orderBorderActive
                      : styles.orderBorderPending,
                  ]}
                />
                <Image
                  source={{ uri: order.product.imageUrl || 'https://via.placeholder.com/64' }}
                  style={styles.orderImage}
                />
                <View style={styles.orderDetails}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.customerName}>{order.customer.fullName}</Text>
                    <View
                      style={[
                        styles.paymentBadge,
                        order.payment.status === 'PAID' || order.payment.status === 'COMPLETED'
                          ? styles.paymentBadgePaid
                          : styles.paymentBadgePending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.paymentBadgeText,
                          order.payment.status === 'PAID' || order.payment.status === 'COMPLETED'
                            ? styles.paymentBadgeTextPaid
                            : styles.paymentBadgeTextPending,
                        ]}
                      >
                        {order.payment.status === 'PAID' || order.payment.status === 'COMPLETED'
                          ? 'PAID'
                          : 'PENDING'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.pickupTime}>
                    🕐 Pickup:{' '}
                    {new Date(order.pickupWindowEnd).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={styles.orderInfo}>
                    {order.product.name} x{order.quantity} • {order.orderNumber}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    marginTop: 12,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  ordersContainer: {
    gap: 12,
    paddingBottom: 40,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  orderBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  orderBorderActive: {
    backgroundColor: colors.primary,
  },
  orderBorderPending: {
    backgroundColor: colors.border,
  },
  orderImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginLeft: 8,
    marginRight: 12,
  },
  orderDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  paymentBadgePaid: {
    backgroundColor: '#dcfce7',
  },
  paymentBadgePending: {
    backgroundColor: '#f3f4f6',
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  paymentBadgeTextPaid: {
    color: colors.success,
  },
  paymentBadgeTextPending: {
    color: colors.text.secondary,
  },
  pickupTime: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  orderInfo: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
});

export default SellerOrdersScreen;
