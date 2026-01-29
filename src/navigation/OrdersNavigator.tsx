import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OrderHistoryScreen from '../screens/booking/OrderHistoryScreen';
import OrderDetailScreen from '../screens/booking/OrderDetailScreen';

export type OrdersStackParamList = {
  OrderList: undefined;
  OrderDetail: { bookingId: string };
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

const OrdersNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OrderList" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
  );
};

export default OrdersNavigator;
