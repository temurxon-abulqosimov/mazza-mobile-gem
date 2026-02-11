import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainAppNavigator from './MainAppNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AddProductScreen from '../screens/seller/AddProductScreen';
import SellerOrderDetailScreen from '../screens/seller/SellerOrderDetailScreen';
import QRScannerScreen from '../screens/seller/QRScannerScreen';
import AddReviewScreen from '../screens/reviews/AddReviewScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import VerifyOtpScreen from '../screens/auth/VerifyOtpScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';

export type RootStackParamList = {
  MainApp: undefined;
  Login: undefined;
  Register: undefined;
  AddProduct: { product?: any }; // Updated to support editing
  EditStoreProfile: undefined;
  SellerOrderDetail: { order: any };
  QRScanner: undefined;
  AddReview: {
    bookingId: string;
    productId: string;
    productName: string;
    productImage: string | null;
    storeName: string;
  };
  ForgotPassword: undefined;
  VerifyOtp: { email: string };
  ResetPassword: { email: string; otp: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * RootNavigator - Entry point for app navigation
 *
 * Guests can browse the app without authentication.
 * Protected actions (booking, favorites, etc.) will prompt for login via modals.
 */
const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator id="RootStack" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainApp" component={MainAppNavigator} />
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: true, title: 'Login' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: true, title: 'Create Account' }}
          />
          <Stack.Screen
            name="AddProduct"
            component={AddProductScreen}
            options={{ headerShown: true, title: 'Add Product' }}
          />
          <Stack.Screen
            name="EditStoreProfile"
            component={require('../screens/seller/EditStoreProfileScreen').default}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SellerOrderDetail"
            component={SellerOrderDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="QRScanner"
            component={QRScannerScreen}
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="AddReview"
            component={AddReviewScreen}
            options={{ headerShown: false, presentation: 'modal' }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ headerShown: true, title: 'Forgot Password' }}
          />
          <Stack.Screen
            name="VerifyOtp"
            component={VerifyOtpScreen}
            options={{ headerShown: true, title: 'Verify OTP' }}
          />
          <Stack.Screen
            name="ResetPassword"
            component={ResetPasswordScreen}
            options={{ headerShown: true, title: 'Reset Password' }}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
