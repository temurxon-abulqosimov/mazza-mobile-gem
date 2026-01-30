import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiscoveryNavigator from './DiscoveryNavigator';
import OrdersNavigator from './OrdersNavigator';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ProfileNavigator from './ProfileNavigator';
import AdminNavigator from './AdminNavigator';
import { useAuthStore } from '../state/authStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserRole } from '../domain/enums/UserRole';
import { ActivityIndicator, View } from 'react-native';

export type MainTabParamList = {
  Discover: undefined;
  Orders: undefined;
  Favorites: undefined;
  Profile: undefined;
  Admin: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainAppNavigator = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;
  const { userProfile, isLoading } = useUserProfile();

  // Show loading while checking user role
  if (isAuthenticated && isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  // Show admin dashboard if user is admin
  if (isAuthenticated && userProfile?.role === UserRole.ADMIN) {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Admin"
          component={AdminNavigator}
          options={{ headerShown: false, tabBarLabel: 'Dashboard' }}
        />
      </Tab.Navigator>
    );
  }

  // Show regular consumer/seller tabs
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Discover"
        component={DiscoveryNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default MainAppNavigator;