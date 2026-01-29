import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DiscoveryNavigator from './DiscoveryNavigator';
import OrdersNavigator from './OrdersNavigator'; // Updated
import FavoritesScreen from '../screens/favorites/FavoritesScreen';
import ProfileNavigator from './ProfileNavigator';

export type MainTabParamList = {
  Discover: undefined;
  Orders: undefined;
  Favorites: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainAppNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Discover" 
        component={DiscoveryNavigator}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersNavigator} // Use the stack navigator
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