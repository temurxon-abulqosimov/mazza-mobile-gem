import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView, Image, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../state/authStore';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { MainTabParamList } from '../../navigation/MainAppNavigator';
import { UserRole } from '../../domain/enums/UserRole';

type ProfileNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>,
  BottomTabNavigationProp<MainTabParamList>
>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;

  const { userProfile, isLoading, isError, refetch } = useUserProfile();
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => logout() }
    ]);
  }

  // Guest State View
  if (!isAuthenticated) {
    return <GuestProfileView />;
  }

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (isError || !userProfile) {
    return (
      <View style={styles.centered}>
        <Text>Could not load profile.</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  const canBecomeSeller = userProfile.role === UserRole.CONSUMER;
  const isSeller = userProfile.role === UserRole.SELLER;

  // Debug: Log the role to console
  console.log('User Profile Role:', userProfile.role);
  console.log('Is Seller?', isSeller);
  console.log('Can Become Seller?', canBecomeSeller);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* DEBUG: Show current role */}
      <View style={styles.debugBanner}>
        <Text style={styles.debugText}>
          Current Role: {userProfile.role} | Is Seller: {isSeller ? 'YES' : 'NO'}
        </Text>
      </View>

      <View style={styles.header}>
        <Image source={{ uri: userProfile.avatarUrl || 'https://via.placeholder.com/100' }} style={styles.avatar} />
        <Text style={styles.fullName}>{userProfile.fullName}</Text>
        <Text style={styles.email}>{userProfile.email}</Text>
        <Text style={styles.memberSince}>Member since {new Date(userProfile.memberSince).toLocaleDateString()}</Text>
        {isSeller && <Text style={styles.sellerBadge}>🏪 Seller</Text>}
      </View>

      <View style={styles.gamificationSection}>
        <Text style={styles.levelName}>{userProfile.level.name} Food Saver</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${userProfile.level.progress}%` }]} />
        </View>
      </View>

      <View style={styles.statsContainer}>
          <StatCard label="Meals Saved" value={userProfile.stats.mealsSaved} />
          <StatCard label="CO2 Prevented (kg)" value={userProfile.stats.co2Prevented.toFixed(1)} />
          <StatCard label="Money Saved" value={`$${userProfile.stats.moneySaved.toFixed(2)}`} />
      </View>

      {/* Seller Dashboard Section - Shown for SELLER role */}
      {isSeller && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELLER DASHBOARD</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Coming Soon', 'Seller dashboard is under development')}
          >
            <Text style={styles.menuItemIcon}>📊</Text>
            <Text style={styles.menuItemText}>Dashboard & Analytics</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Coming Soon', 'Product management is under development')}
          >
            <Text style={styles.menuItemIcon}>📦</Text>
            <Text style={styles.menuItemText}>Manage Products</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Coming Soon', 'Orders management is under development')}
          >
            <Text style={styles.menuItemIcon}>📋</Text>
            <Text style={styles.menuItemText}>View Orders</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Coming Soon', 'Store settings is under development')}
          >
            <Text style={styles.menuItemIcon}>⚙️</Text>
            <Text style={styles.menuItemText}>Store Settings</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Become a Seller CTA - Prominent Card - Only for CONSUMERS */}
      {canBecomeSeller && (
        <TouchableOpacity
          style={styles.becomeSellerCard}
          onPress={() => navigation.navigate('BecomeSeller')}
        >
          <View style={styles.becomeSellerIcon}>
            <Text style={styles.becomeSellerIconText}>🏪</Text>
          </View>
          <View style={styles.becomeSellerContent}>
            <Text style={styles.becomeSellerTitle}>Become a Seller</Text>
            <Text style={styles.becomeSellerSubtitle}>Own a food business? Sell on Mazza</Text>
          </View>
          <Text style={styles.becomeSellerArrow}>›</Text>
        </TouchableOpacity>
      )}

      {/* My Activity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MY ACTIVITY</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Orders')}>
          <Text style={styles.menuItemIcon}>📦</Text>
          <Text style={styles.menuItemText}>My Orders</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemIcon}>❤️</Text>
          <Text style={styles.menuItemText}>Saved Places</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemIcon}>💳</Text>
          <Text style={styles.menuItemText}>Payment Methods</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SETTINGS</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuItemIcon}>🔔</Text>
          <Text style={styles.menuItemText}>Notifications</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemIcon}>❓</Text>
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.statCard}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

/**
 * Guest Profile View
 * Shown when user is not authenticated
 * Based on Stitch design "GUEST STATE PREVIEW"
 */
const GuestProfileView = () => {
  const navigation = useNavigation<any>(); // Use any for now to avoid type issues

  return (
    <ScrollView style={styles.container}>
      <View style={styles.guestContainer}>
        {/* Hero Section */}
        <View style={styles.guestHero}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400' }}
            style={styles.guestHeroImage}
          />
          <View style={styles.guestHeroOverlay}>
            <Text style={styles.guestHeroText}>Join thousands of food savers.</Text>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.guestCTA}>
          <Text style={styles.guestTitle}>Join the fight against food waste</Text>
          <Text style={styles.guestSubtitle}>
            Save money and save the planet by rescuing delicious food nearby.
          </Text>

          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* About Mazza Section */}
        <View style={styles.guestAboutSection}>
          <Text style={styles.guestAboutTitle}>ABOUT MAZZA</Text>

          <TouchableOpacity style={styles.guestAboutItem}>
            <Text style={styles.guestAboutItemText}>How it Works</Text>
            <Text style={styles.guestAboutItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestAboutItem}>
            <Text style={styles.guestAboutItemText}>Support</Text>
            <Text style={styles.guestAboutItemArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  debugBanner: {
    backgroundColor: '#FFE5E5',
    borderBottomWidth: 2,
    borderBottomColor: '#FF0000',
    padding: 12,
  },
  debugText: {
    color: '#CC0000',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  memberSince: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  sellerBadge: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FFF5F2',
    borderRadius: 12,
    overflow: 'hidden',
  },
  gamificationSection: {
      padding: 20,
      alignItems: 'center',
  },
  levelName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 8,
  },
  progressBarContainer: {
      height: 20,
      width: '80%',
      backgroundColor: '#e0e0e0',
      borderRadius: 10,
  },
  progressBar: {
      height: '100%',
      backgroundColor: '#4CAF50',
      borderRadius: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  statCard: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      width: '30%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
  },
  statValue: {
      fontSize: 20,
      fontWeight: 'bold',
  },
  statLabel: {
      fontSize: 12,
      color: '#666',
      marginTop: 4,
      textAlign: 'center',
  },
  // Become a Seller Card
  becomeSellerCard: {
    backgroundColor: '#FFF5F2',
    borderColor: '#FF6B35',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  becomeSellerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  becomeSellerIconText: {
    fontSize: 24,
  },
  becomeSellerContent: {
    flex: 1,
  },
  becomeSellerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  becomeSellerSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  becomeSellerArrow: {
    fontSize: 24,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  // Menu Sections
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 12,
    marginBottom: 8,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#ccc',
  },
  // Logout
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
  // Guest Profile Styles
  guestContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  guestHero: {
    height: 300,
    position: 'relative',
  },
  guestHeroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  guestHeroOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  guestHeroText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  guestCTA: {
    backgroundColor: 'white',
    padding: 24,
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  guestSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  createAccountButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  createAccountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  guestAboutSection: {
    backgroundColor: 'white',
    marginTop: 20,
    padding: 20,
  },
  guestAboutTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999',
    marginBottom: 16,
    letterSpacing: 1,
  },
  guestAboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guestAboutItemText: {
    fontSize: 16,
    color: '#333',
  },
  guestAboutItemArrow: {
    fontSize: 24,
    color: '#999',
  },
});

export default ProfileScreen;