import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import BecomeSellerScreen from '../screens/profile/BecomeSellerScreen';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  BecomeSeller: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="BecomeSeller" component={BecomeSellerScreen} options={{ presentation: 'modal' }}/>
    </Stack.Navigator>
  );
};

export default ProfileNavigator;
