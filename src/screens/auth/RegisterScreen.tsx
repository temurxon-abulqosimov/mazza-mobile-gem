import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema, RegisterFormData } from '../../domain/validators/AuthValidators';
import ControlledInput from '../../components/forms/ControlledInput';
import { useNavigation } from '@react-navigation/native';

/**
 * RegisterScreen - User registration form
 *
 * Note: Market selection is simplified for now - uses a default market ID
 * TODO: Add market selection UI in the future
 */
const RegisterScreen = () => {
  const navigation = useNavigation();
  const { register, isRegistering } = useAuth();
  const [agreed, setAgreed] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      marketId: '550e8400-e29b-41d4-a716-446655440000', // Default market ID for now
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    if (!agreed) {
      Alert.alert('Terms Required', 'Please agree to the Terms & Conditions to continue');
      return;
    }

    register(data, {
      onSuccess: () => {
        Alert.alert('Success!', 'Account created successfully', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to create account';
        Alert.alert('Registration Failed', message);
      },
    });
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the fight against food waste</Text>
      </View>

      <View style={styles.form}>
        <ControlledInput
          control={control}
          name="fullName"
          label="Full Name"
          placeholder="Alex Johnson"
          autoCapitalize="words"
          error={errors.fullName}
        />

        <ControlledInput
          control={control}
          name="email"
          label="Email"
          placeholder="alex@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <ControlledInput
          control={control}
          name="password"
          label="Password"
          placeholder="Minimum 8 characters"
          secureTextEntry
          error={errors.password}
        />

        {/* Terms & Conditions */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to the{' '}
            <Text style={styles.link}>Terms & Conditions</Text>
          </Text>
        </TouchableOpacity>

        {/* Create Account Button */}
        <TouchableOpacity
          style={[styles.submitButton, isRegistering && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isRegistering}
        >
          {isRegistering ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.loginLinkText}>
            Already have an account?{' '}
            <Text style={styles.loginLinkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 24,
    paddingTop: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    width: '100%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  link: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#666',
  },
  loginLinkBold: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
