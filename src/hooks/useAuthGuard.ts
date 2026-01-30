import { useAuthStore } from '../state/authStore';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Auth Guard Hook
 *
 * Provides a function to check if user is authenticated before performing protected actions.
 * Shows an alert prompting the user to login if not authenticated.
 *
 * @returns {Function} requireAuth - Returns true if authenticated, false otherwise
 *
 * @example
 * const { requireAuth } = useAuthGuard();
 *
 * const handleReserve = () => {
 *   if (!requireAuth('Please login to reserve products')) {
 *     return; // User not authenticated, alert shown
 *   }
 *   // Proceed with reservation
 * };
 */
export const useAuthGuard = () => {
  const navigation = useNavigation<NavigationProp>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;

  const requireAuth = (message: string = 'Please login to continue'): boolean => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        message,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => {
              navigation.navigate('Login');
            },
          },
        ]
      );
      return false;
    }
    return true;
  };

  return {
    isAuthenticated,
    requireAuth,
  };
};
