import React from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema, LoginFormData } from '../../domain/validators/AuthValidators';
import ControlledInput from '../../components/forms/ControlledInput';

const LoginScreen = () => {
  const { login, isLoggingIn, loginError } = useAuth();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onError: (error: any) => {
        const message = error.response?.data?.message || 'An unexpected error occurred.';
        Alert.alert('Login Failed', message);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to MAZZA</Text>
      
      <ControlledInput
        control={control}
        name="email"
        label="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <ControlledInput
        control={control}
        name="password"
        label="Password"
        secureTextEntry
        error={errors.password}
      />

      {isLoggingIn ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleSubmit(onSubmit)} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
});

export default LoginScreen;