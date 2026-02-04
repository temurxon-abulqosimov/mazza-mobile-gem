import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import PendingSellersScreen from '../screens/admin/PendingSellersScreen';

export type AdminStackParamList = {
  AdminDashboard: undefined;
  PendingSellers: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

const AdminNavigator = () => {
  return (
    <Stack.Navigator id="AdminStack">
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PendingSellers"
        component={PendingSellersScreen}
        options={{
          headerShown: true,
          title: 'Pending Sellers',
          headerStyle: { backgroundColor: '#FF6B35' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
