import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../api/client';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import Icon from '../../components/ui/Icon';
import { IconName } from '../../theme/icons';

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

interface AdminStats {
  totalUsers: number;
  activeSellers: number;
  pendingSellers: number;
  totalProducts: number;
  totalOrders: number;
}

const AdminDashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/stats');
      return data.data as AdminStats;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    setRefreshing(false);
  };

  const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{isLoading ? '...' : value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const MenuCard = ({ icon, title, subtitle, onPress, badge }: {
    icon: IconName;
    title: string;
    subtitle: string;
    onPress: () => void;
    badge?: number;
  }) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Icon name={icon} size={24} color="#FF6B35" />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Icon name="chevron-right" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF6B35']} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your marketplace</Text>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <StatCard title="Total Users" value={stats?.totalUsers || 0} color="#4CAF50" />
        <StatCard title="Active Sellers" value={stats?.activeSellers || 0} color="#FF6B35" />
      </View>
      <View style={styles.statsContainer}>
        <StatCard title="Total Products" value={stats?.totalProducts || 0} color="#2196F3" />
        <StatCard title="Total Orders" value={stats?.totalOrders || 0} color="#9C27B0" />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

        <MenuCard
          icon="user"
          title="Pending Sellers"
          subtitle="Review seller applications"
          badge={stats?.pendingSellers}
          onPress={() => navigation.navigate('PendingSellers')}
        />

        <MenuCard
          icon="dashboard"
          title="Platform Stats"
          subtitle="View detailed analytics"
          onPress={() => {
            // TODO: Navigate to stats
            console.log('Navigate to stats');
          }}
        />

        <MenuCard
          icon="store"
          title="Manage Stores"
          subtitle="View and manage all stores"
          onPress={() => {
            // TODO: Navigate to stores
            console.log('Navigate to stores');
          }}
        />

        <MenuCard
          icon="package"
          title="Manage Products"
          subtitle="View and manage all products"
          onPress={() => {
            // TODO: Navigate to products
            console.log('Navigate to products');
          }}
        />

        <MenuCard
          icon="users"
          title="User Management"
          subtitle="Manage user accounts"
          onPress={() => {
            // TODO: Navigate to users
            console.log('Navigate to users');
          }}
        />
      </View>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B35',
    padding: 24,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 12,
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 1,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  menuIconText: {
    // fontSize: 24,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  menuArrow: {
    // fontSize: 24,
    // color: '#ccc',
  },
  logoutSection: {
    padding: 16,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  logoutButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdminDashboardScreen;
