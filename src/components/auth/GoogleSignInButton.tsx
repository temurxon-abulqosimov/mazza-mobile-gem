import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { colors } from '../../theme';

interface GoogleSignInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onPress,
  isLoading = false,
  disabled = false,
  label = 'Continue with Google',
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, (isLoading || disabled) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isLoading || disabled}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <ActivityIndicator color="#666" />
      ) : (
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <GoogleIcon />
          </View>
          <Text style={styles.text}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const GoogleIcon = () => (
  <View style={styles.googleIcon}>
    <Text style={styles.googleG}>G</Text>
  </View>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleG: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default GoogleSignInButton;
