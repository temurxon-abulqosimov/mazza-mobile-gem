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

const SellerDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useUserProfile();
  const { stats, isLoading, error, refetch } = useDashboardStats();
  const { toggleStatus, isToggling } = useStoreStatus();
  const { orders = [], isLoading: isLoadingOrders, refetch: refetchOrders } = useLiveOrders();

  // Local state for optimistic UI update
  const [localIsOpen, setLocalIsOpen] = useState<boolean | null>(null);

  // Determine the current store status (local state takes precedence for optimistic updates)
  const currentIsOpen = localIsOpen !== null ? localIsOpen : stats?.isOpen ?? true;

  // Pull-to-refresh callback
  const onRefresh = useCallback(() => {
    refetch();
    refetchOrders();
    setLocalIsOpen(null); // Reset optimistic state on refresh
  }, [refetch, refetchOrders]);

  // Handle toggle
  const handleToggleStatus = useCallback((newValue: boolean) => {
    setLocalIsOpen(newValue); // Optimistic update
    toggleStatus(newValue, {
      onSuccess: () => {
        // Reset optimistic state when server confirms
        setLocalIsOpen(null);
        refetch();
      },
      onError: () => {
        // Revert optimistic update on error
        setLocalIsOpen(null);
      },
    });
  }, [toggleStatus, refetch]);

  // Format cents to dollars
  const formatCurrency = useCallback((cents: number) => {
    return (cents / 100).toFixed(2);
  }, []);

  // Memoized stat cards to avoid unnecessary re-renders
  const statCards = useMemo(() => {
    if (!stats) return null;

    return (
      <>
        <View style={[styles.statCard, styles.statCardOrange]}>
          <View style={styles.statHeader}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIconText}>💵</Text>
            </View>
            {stats.earningsChange != null && stats.earningsChange !== 0 && (
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>
                  {stats.earningsChange > 0 ? '+' : ''}
                  {stats.earningsChange.toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.statValue}>${formatCurrency(stats.todaysEarnings)}</Text>
          <Text style={styles.statLabel}>Today's Earnings</Text>
        </View>

        <View style={[styles.statCard, styles.statCardOrange]}>
          <View style={styles.statHeader}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIconText}>🛍️</Text>
            </View>
          </View>
          <Text style={styles.statValue}>{stats.ordersRescued}</Text>
          <Text style={styles.statLabel}>Orders Rescued</Text>
        </View>

        <View style={[styles.statCard, styles.statCardOrange]}>
          <View style={styles.statHeader}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIconText}>📦</Text>
            </View>
          </View>
          <Text style={styles.statValue}>{stats.activeListings}</Text>
          <Text style={styles.statLabel}>Active Listings</Text>
        </View>

        <View style={[styles.statCard, styles.statCardGreen]}>
          <View style={styles.statHeader}>
            <View style={styles.statIconContainerGreen}>
              <Text style={styles.statIconText}>🌱</Text>
            </View>
          </View>
          <Text style={styles.statValue}>
            {stats.ordersRescued}
            <Text style={styles.statUnit}>kg</Text>
          </Text>
          <Text style={styles.statLabel}>Food Saved</Text>
        </View>
      </>
    );
  }, [stats, formatCurrency]);

  // Loading skeleton for stat cards
  const renderLoadingSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((i) => (
        <View
          key={i}
          style={[
            styles.statCard,
            i === 4 ? styles.statCardGreen : styles.statCardOrange,
            styles.skeletonCard,
          ]}
        >
          <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, styles.skeletonCircle]} />
          </View>
          <View style={[styles.skeletonLine, styles.skeletonLineValue]} />
          <View style={[styles.skeletonLine, styles.skeletonLineLabel]} />
        </View>
      ))}
    </>
  );

  // Error state component
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Unable to load dashboard stats</Text>
      <Text style={styles.errorSubtitle}>
        Please check your connection and try again
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Empty state for new sellers (all stats are 0)
  const renderEmptyState = () => {
    if (!stats) return null;

    const isNewSeller =
      stats.todaysEarnings === 0 &&
      stats.ordersRescued === 0 &&
      stats.activeListings === 0;

    if (!isNewSeller) return null;

    return (
      <View style={styles.newSellerBanner}>
        <Text style={styles.newSellerIcon}>👋</Text>
        <Text style={styles.newSellerTitle}>Welcome to Mazza!</Text>
        <Text style={styles.newSellerSubtitle}>
          Add your first product to start selling and reducing food waste
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: userProfile?.avatarUrl || 'https://via.placeholder.com/40' }}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.storeName}>{userProfile?.fullName || 'Seller'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Text style={styles.notificationIcon}>🔔</Text>
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Store Status Toggle */}
      {stats && (
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <View style={styles.statusLeft}>
              <View style={[
                styles.statusIcon,
                currentIsOpen ? styles.statusIconOpen : styles.statusIconClosed
              ]}>
                <Text style={styles.statusIconText}>{currentIsOpen ? '🔓' : '🔒'}</Text>
              </View>
              <View>
                <Text style={styles.statusLabel}>Store Status</Text>
                <Text style={[
                  styles.statusText,
                  currentIsOpen ? styles.statusTextOpen : styles.statusTextClosed
                ]}>
                  {currentIsOpen ? 'Currently Open' : 'Currently Closed'}
                </Text>
              </View>
            </View>
            <Switch
              value={currentIsOpen}
              onValueChange={handleToggleStatus}
              disabled={isToggling}
              trackColor={{ false: '#cbd5e0', true: '#22C55E' }}
              thumbColor={'#ffffff'}
              ios_backgroundColor="#cbd5e0"
            />
          </View>
        </View>
      )}

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
          {isLoading && !stats ? (
            renderLoadingSkeleton()
          ) : error ? (
            renderErrorState()
          ) : (
            statCards
          )}
        </View>

        {/* New Seller Banner */}
        {stats && renderEmptyState()}

        {/* Live Orders */}
        {stats && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Orders</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Wallet')}>
                <Text style={styles.seeAllButton}>View All</Text>
              </TouchableOpacity>
            </View>

            {isLoadingOrders ? (
              <View style={styles.ordersLoadingContainer}>
                <ActivityIndicator size="small" color="#f46a25" />
                <Text style={styles.ordersLoadingText}>Loading orders...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📋</Text>
                <Text style={styles.emptyStateTitle}>No live orders</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Orders awaiting pickup will appear here
                </Text>
              </View>
            ) : (
              <View style={styles.ordersContainer}>
                {orders.map((order) => (
                  <View key={order.id} style={styles.orderCard}>
                    <View style={[
                      styles.orderBorder,
                      order.payment.status === 'PAID' || order.payment.status === 'COMPLETED'
                        ? styles.orderBorderActive
                        : styles.orderBorderPending
                    ]} />
                    <Image
                      source={{ uri: order.product.imageUrl || 'https://via.placeholder.com/64' }}
                      style={styles.orderImage}
                    />
                    <View style={styles.orderDetails}>
                      <View style={styles.orderHeader}>
                        <Text style={styles.customerName}>{order.customer.fullName}</Text>
                        <View style={[
                          styles.paymentBadge,
                          order.payment.status === 'PAID' || order.payment.status === 'COMPLETED'
                            ? styles.paymentBadgePaid
                            : styles.paymentBadgePending
                        ]}>
                          <Text style={[
                            styles.paymentBadgeText,
                            order.payment.status === 'PAID' || order.payment.status === 'COMPLETED'
                              ? styles.paymentBadgeTextPaid
                              : styles.paymentBadgeTextPending
                          ]}>
                            {order.payment.status === 'PAID' || order.payment.status === 'COMPLETED' ? 'PAID' : 'PENDING'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.pickupTime}>
                        🕐 Pickup: {new Date(order.pickupWindowEnd).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                      <Text style={styles.orderInfo}>
                        {order.product.name} x{order.quantity} • {order.orderNumber}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddProduct')}
      >
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabText}>Add Product</Text>
      </TouchableOpacity>
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
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
