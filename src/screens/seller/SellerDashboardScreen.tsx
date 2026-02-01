import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserProfile } from '../../hooks/useUserProfile';

const SellerDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useUserProfile();

  // Mock data - replace with real API data
  const stats = {
    posted: 0,
    sold: 0,
    revenue: 0,
    foodSaved: 0,
  };

  const activeListings: any[] = []; // Replace with real data

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

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIconText}>📦</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>+12%</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{stats.posted}</Text>
            <Text style={styles.statLabel}>Posted</Text>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIconText}>🛍️</Text>
              </View>
            </View>
            <Text style={styles.statValue}>{stats.sold}</Text>
            <Text style={styles.statLabel}>Sold</Text>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statIconText}>💵</Text>
              </View>
            </View>
            <Text style={styles.statValue}>${stats.revenue}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>

          <View style={[styles.statCard, styles.statCardGreen]}>
            <View style={styles.statHeader}>
              <View style={styles.statIconContainerGreen}>
                <Text style={styles.statIconText}>🌱</Text>
              </View>
            </View>
            <Text style={styles.statValue}>
              {stats.foodSaved}
              <Text style={styles.statUnit}>kg</Text>
            </Text>
            <Text style={styles.statLabel}>Food Saved</Text>
          </View>
        </View>

        {/* Active Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Listings</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {activeListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📦</Text>
              <Text style={styles.emptyStateTitle}>No active listings</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tap the + button below to add your first product
              </Text>
            </View>
          ) : (
            <View style={styles.listingsContainer}>
              {/* Product listings will go here */}
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
    borderBottomWidth: 1,
    borderBottomColor: '#e8d7ce',
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
});

export default SellerDashboardScreen;
