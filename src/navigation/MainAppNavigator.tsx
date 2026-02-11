import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import DiscoveryNavigator from './DiscoveryNavigator';
import OrdersNavigator from './OrdersNavigator';
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ProfileNavigator from './ProfileNavigator';
import AdminNavigator from './AdminNavigator';
import SellerNavigator from './SellerNavigator';
import { useAuthStore } from '../state/authStore';
import { useUserProfile } from '../hooks/useUserProfile';
import { UserRole } from '../domain/enums/UserRole';
import { colors } from '../theme';
import LocationOnboardingScreen from '../screens/onboarding/LocationOnboardingScreen';
import Icon from '../components/ui/Icon';
import MapScreen from '../screens/discovery/MapScreen';

export type MainTabParamList = {
  Discover: undefined;
  Map: undefined;
  Orders: undefined;
  Favorites: undefined;
  Profile: undefined;
  Admin: undefined;
  Seller: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainAppNavigator = () => {
  const { t } = useTranslation();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;
  const { userProfile, isLoading } = useUserProfile();

  // Show loading while checking user role
  if (isAuthenticated && isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // FORCE LOCATION ONBOARDING
  // If user is authenticated but has no location set, show onboarding
  // DISABLED: We now allow users to enter and prompt them contextually
  // if (isAuthenticated && userProfile && userProfile.role === UserRole.CONSUMER && (!userProfile.lat || !userProfile.lng)) {
  //   return <LocationOnboardingScreen />;
  // }

  // Show admin dashboard if user is admin
  if (isAuthenticated && userProfile?.role === UserRole.ADMIN) {
    return (
      <Tab.Navigator
        id="AdminTabs"
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
            tabBarLabel: t('navigation.dashboard'),
            tabBarIcon: ({ size, color }) => (
              <Icon name="dashboard" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    );
  }

  // Show seller dashboard if user is seller
  if (isAuthenticated && userProfile?.role === UserRole.SELLER) {
    return <SellerNavigator />;
  }

  // Show regular consumer tabs
  return (
    <Tab.Navigator
      id="ConsumerTabs"
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
          tabBarLabel: t('navigation.home'),
          tabBarIcon: ({ size, focused, color }) => (
            <Icon name={focused ? "home-filled" : "home"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerShown: false,
          tabBarLabel: t('navigation.map'),
          tabBarIcon: ({ size, focused, color }) => (
            <Icon name={focused ? "discovery-filled" : "discovery"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          headerShown: false,
          tabBarLabel: t('navigation.orders'),
          tabBarIcon: ({ size, focused, color }) => (
            <Icon name={focused ? "orders-filled" : "orders"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          headerShown: false,
          tabBarLabel: t('navigation.saved'),
          tabBarIcon: ({ size, focused, color }) => (
            <Icon name={focused ? "heart-filled" : "heart"} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          headerShown: false,
          tabBarLabel: t('navigation.profile'),
          tabBarIcon: ({ size, focused, color }) => (
            <Icon name={focused ? "user-filled" : "user"} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainAppNavigator;
