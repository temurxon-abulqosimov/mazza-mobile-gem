import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { useStoreStatus } from '../../hooks/useStoreStatus';
import { useLiveOrders } from '../../hooks/useLiveOrders';
import Icon from '../../components/ui/Icon';
import { colors } from '../../theme';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';

const SellerDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useUserProfile();
  const { stats, isLoading, error, refetch } = useDashboardStats();
  const { toggleStatus, isToggling } = useStoreStatus();
  const { orders = [], isLoading: isLoadingOrders, refetch: refetchOrders } = useLiveOrders();

  const onRefresh = useCallback(() => {
    refetch();
    refetchOrders();
  }, [refetch, refetchOrders]);

  // ... existing hooks from verified content

  return (
    <SafeAreaWrapper>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileImageContainer}
          >
            <Image
              source={{ uri: userProfile?.avatarUrl || 'https://via.placeholder.com/40' }}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </TouchableOpacity>
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
            <Text style={styles.storeName}>{userProfile?.fullName || 'Seller'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('QRScanner')}>
            <Icon name="qr-code" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Icon name="notification" size={24} color={colors.text.primary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Store Status Toggle */}
      <View style={styles.statusContainer}>
        <View style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusIcon, styles.statusIconOpen]}>
              <Icon name="store" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statusLabel}>Store Status</Text>
              <Text style={[styles.statusText, styles.statusTextOpen]}>
                Open for Orders
              </Text>
            </View>
          </View>
          <Switch
            value={true} // TODO: hook up to real status
            onValueChange={toggleStatus}
            trackColor={{ false: '#e8d7ce', true: '#dcfce7' }}
            thumbColor={'#22c55e'}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && !!stats}
            onRefresh={onRefresh}
            tintColor="#f46a25"
            colors={['#f46a25']}
          />
        }
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainer}>
                <Icon name="dollar-sign" size={20} color={colors.primary} />
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>+12%</Text>
              </View>
            </View>
            <Text style={styles.statValue}>${stats?.todaysEarnings || '0'}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>

          <View style={[styles.statCard, styles.statCardGreen]}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainerGreen}>
                <Icon name="orders" size={20} color={colors.success} />
              </View>
            </View>
            <Text style={styles.statValue}>{stats?.ordersRescued || '0'}</Text>
            <Text style={styles.statLabel}>Orders Rescued</Text>
          </View>
        </View>

        {/* Live Orders Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SellerOrders')}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {(orders as any[])?.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="orders" size={48} color={colors.text.tertiary} style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateTitle}>No Active Orders</Text>
              <Text style={styles.emptyStateSubtitle}>New orders will appear here</Text>
            </View>
          ) : (
            <View style={styles.ordersContainer}>
              {(orders as any[]).map((order: any) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => navigation.navigate('SellerOrders', { orderId: order.id })}
                >
                  <View style={[styles.orderBorder, styles.orderBorderActive]} />
                  <View style={styles.orderDetails}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.customerName}>Order #{order.id.slice(-4)}</Text>
                      <View style={[styles.paymentBadge, styles.paymentBadgePaid]}>
                        <Text style={styles.paymentBadgeTextPaid}>{order.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.orderInfo}>{order.quantity} items • ${order.totalPrice}</Text>
                    <Text style={styles.pickupTime}>Pickup: Today</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Icon name="plus" size={24} color="white" style={styles.fabIcon} />
        <Text style={styles.fabText}>Add Product</Text>
      </TouchableOpacity>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f5',
  },
  header: {
    backgroundColor: '#f8f6f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Removed paddingTop: 60 or similar specific padding
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // ...
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f46a25',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#f8f6f5',
  },
  welcomeText: {
    fontSize: 12,
    color: '#9c6549',
    fontWeight: '500',
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c120d',
  },
  scanButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff5ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonIcon: {
    fontSize: 20,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f46a25',
    borderWidth: 2,
    borderColor: '#f8f6f5',
  },
  scrollContent: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
  },
  statCardOrange: {
    borderColor: '#e8d7ce',
  },
  statCardGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#d1fae5',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff5ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconContainerGreen: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statIconText: {
    fontSize: 20,
  },
  statBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c120d',
    marginTop: 8,
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9c6549',
  },
  statLabel: {
    fontSize: 13,
    color: '#9c6549',
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c120d',
  },
  seeAllButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f46a25',
  },
  listingsContainer: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8d7ce',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c120d',
    marginBottom: 4,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#9c6549',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f46a25',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#f46a25',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
  fabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Loading Skeleton Styles
  skeletonCard: {
    opacity: 0.6,
  },
  skeletonCircle: {
    backgroundColor: '#e8d7ce',
  },
  skeletonLine: {
    backgroundColor: '#e8d7ce',
    borderRadius: 4,
    marginTop: 8,
  },
  skeletonLineValue: {
    height: 28,
    width: '60%',
  },
  skeletonLineLabel: {
    height: 16,
    width: '80%',
    marginTop: 4,
  },
  // Error State Styles
  errorContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8d7ce',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1c120d',
    marginBottom: 4,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#9c6549',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#f46a25',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  // New Seller Banner Styles
  newSellerBanner: {
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    backgroundColor: '#fff5ed',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
    alignItems: 'center',
  },
  newSellerIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  newSellerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c120d',
    marginBottom: 4,
  },
  newSellerSubtitle: {
    fontSize: 13,
    color: '#9c6549',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  // Placeholder Text
  placeholderText: {
    fontSize: 14,
    color: '#9c6549',
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Store Status Toggle Styles
  statusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f6f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e8d7ce',
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8d7ce',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIconOpen: {
    backgroundColor: '#dcfce7',
  },
  statusIconClosed: {
    backgroundColor: '#fee2e2',
  },
  statusIconText: {
    fontSize: 20,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1c120d',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statusTextOpen: {
    color: '#22C55E',
  },
  statusTextClosed: {
    color: '#ef4444',
  },
  // Live Orders Styles
  ordersLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8d7ce',
    gap: 12,
  },
  ordersLoadingText: {
    fontSize: 14,
    color: '#9c6549',
  },
  ordersContainer: {
    gap: 12,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e8d7ce',
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
    backgroundColor: '#f46a25',
  },
  orderBorderPending: {
    backgroundColor: '#cbd5e0',
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
    color: '#1c120d',
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
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  paymentBadgeTextPaid: {
    color: '#16a34a',
  },
  paymentBadgeTextPending: {
    color: '#6b7280',
  },
  pickupTime: {
    fontSize: 12,
    color: '#9c6549',
    fontWeight: '500',
  },
  orderInfo: {
    fontSize: 13,
    color: '#1c120d',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default SellerDashboardScreen;
