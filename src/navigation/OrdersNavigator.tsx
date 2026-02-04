import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from '../screens/map/MapScreen';
import OrderHistoryScreen from '../screens/booking/OrderHistoryScreen';
import OrderDetailScreen from '../screens/booking/OrderDetailScreen';

import OrderHistoryHeader from '../components/navigation/OrderHistoryHeader';

export type OrdersStackParamList = {
  Map: undefined;
  OrderList: undefined;
  OrderDetail: { bookingId: string };
};

const Stack = createNativeStackNavigator<OrdersStackParamList>();

const OrdersNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OrderList"
        component={OrderHistoryScreen}
        options={{
          header: () => <OrderHistoryHeader />,
        }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default OrdersNavigator;
