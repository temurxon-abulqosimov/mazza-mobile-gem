import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoveryScreen from '../screens/discovery/DiscoveryScreen';
import ProductDetailScreen from '../screens/discovery/ProductDetailScreen';
import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';
import { Booking } from '../domain/Booking';

export type DiscoveryStackParamList = {
  DiscoveryFeed: undefined;
  ProductDetail: { productId: string };
  BookingConfirmation: { booking: Booking };
};

const Stack = createNativeStackNavigator<DiscoveryStackParamList>();

const DiscoveryNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoveryFeed" component={DiscoveryScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} options={{ presentation: 'modal' }}/>
    </Stack.Navigator>
  );
};

export default DiscoveryNavigator;