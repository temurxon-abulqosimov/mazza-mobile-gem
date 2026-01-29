import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../state/authStore';
import AuthNavigator from './AuthNavigator';
import MainAppNavigator from './MainAppNavigator';

const RootNavigator = () => {
  const accessToken = useAuthStore((state) => state.accessToken);

  // For initial setup, we'll assume a user is not logged in.
  // In the future, we'll check for a token in SecureStore here.
  const isAuthenticated = !!accessToken;

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainAppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
