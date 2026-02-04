import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text } from 'react-native';
import DiscoveryNavigator from './DiscoveryNavigator';
import OrdersNavigator from './OrdersNavigator';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ProfileNavigator from './ProfileNavigator';
import AdminNavigator from './AdminNavigator';
import { useAuthStore } from '../state/authStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserRole } from '../domain/enums/UserRole';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../theme';

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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Show admin dashboard if user is admin
  if (isAuthenticated && userProfile?.role === UserRole.ADMIN) {
    return (
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarStyle: {
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            backgroundColor: colors.card,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tab.Screen
          name="Admin"
          component={AdminNavigator}
          options={{
            headerShown: false,
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ size }) => (
              <Text style={{ fontSize: size }}>📊</Text>
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // Show regular consumer/seller tabs
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          backgroundColor: colors.card,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Discover"
        component={DiscoveryNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Map',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>🗺️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          headerShown: false,
          tabBarLabel: 'Saved',
          tabBarIcon: ({ size, focused }) => (
            <Text style={{ fontSize: size }}>{focused ? '❤️' : '🤍'}</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ size }) => (
            <Text style={{ fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainAppNavigator;
