import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import BecomeSellerScreen from '../screens/profile/BecomeSellerScreen';
import SellerDashboardScreen from '../screens/seller/SellerDashboardScreen';
import ManageProductsScreen from '../screens/seller/ManageProductsScreen';
import SellerOrdersScreen from '../screens/seller/SellerOrdersScreen';
import StoreSettingsScreen from '../screens/seller/StoreSettingsScreen';
import AddProductScreen from '../screens/seller/AddProductScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  Notifications: undefined;
  BecomeSeller: undefined;
  SellerDashboard: undefined;
  ManageProducts: undefined;
  SellerOrders: undefined;
  StoreSettings: undefined;
  AddProduct: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator id="ProfileStack" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="BecomeSeller" component={BecomeSellerScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <Stack.Screen name="ManageProducts" component={ManageProductsScreen} />
      <Stack.Screen name="SellerOrders" component={SellerOrdersScreen} />
      <Stack.Screen name="StoreSettings" component={StoreSettingsScreen} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
