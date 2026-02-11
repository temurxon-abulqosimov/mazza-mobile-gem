import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoveryScreen from '../screens/discovery/DiscoveryScreen';
import ProductDetailScreen from '../screens/discovery/ProductDetailScreen';
import StoreProfileScreen from '../screens/discovery/StoreProfileScreen';
import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';
import { DiscoveryStackParamList } from './types';

export { DiscoveryStackParamList };

const Stack = createNativeStackNavigator<DiscoveryStackParamList>();

const DiscoveryNavigator = () => {
  return (
    <Stack.Navigator id="DiscoveryStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoveryFeed" component={DiscoveryScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="StoreProfile" component={StoreProfileScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SellerList" component={require('../screens/discovery/SellerListScreen').default} />
    </Stack.Navigator>
  );
};

export default DiscoveryNavigator;