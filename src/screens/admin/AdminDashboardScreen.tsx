import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const StatCard = ({ title, value, color }: { title: string; value: string | number; color: string }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const MenuCard = ({ icon, title, subtitle, onPress }: { icon: string; title: string; subtitle: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.menuCard} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Text style={styles.menuIconText}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.menuArrow}>›</Text>
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
        <StatCard title="Total Users" value="0" color="#4CAF50" />
        <StatCard title="Active Sellers" value="0" color="#FF6B35" />
      </View>
      <View style={styles.statsContainer}>
        <StatCard title="Total Products" value="0" color="#2196F3" />
        <StatCard title="Total Orders" value="0" color="#9C27B0" />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>QUICK ACTIONS</Text>

        <MenuCard
          icon="👤"
          title="Pending Sellers"
          subtitle="Review seller applications"
          onPress={() => {
            // TODO: Navigate to pending sellers
            console.log('Navigate to pending sellers');
          }}
        />

        <MenuCard
          icon="📊"
          title="Platform Stats"
          subtitle="View detailed analytics"
          onPress={() => {
            // TODO: Navigate to stats
            console.log('Navigate to stats');
          }}
        />

        <MenuCard
          icon="🏪"
          title="Manage Stores"
          subtitle="View and manage all stores"
          onPress={() => {
            // TODO: Navigate to stores
            console.log('Navigate to stores');
          }}
        />

        <MenuCard
          icon="📦"
          title="Manage Products"
          subtitle="View and manage all products"
          onPress={() => {
            // TODO: Navigate to products
            console.log('Navigate to products');
          }}
        />

        <MenuCard
          icon="👥"
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
  },
  menuIconText: {
    fontSize: 24,
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
    fontSize: 24,
    color: '#ccc',
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
