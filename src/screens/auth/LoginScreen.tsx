import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { loginSchema, LoginFormData } from '../../domain/validators/AuthValidators';
import ControlledInput from '../../components/forms/ControlledInput';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const LoginScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { login, isLoggingIn } = useAuth();
  const { signInWithGoogle, isLoading: isGoogleLoading, isReady: isGoogleReady, isConfigured: isGoogleConfigured } = useGoogleSignIn({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: (error) => {
      console.error('Google Sign-In error:', error);
    },
  });

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data, {
      onSuccess: () => {
        navigation.goBack();
      },
      onError: (error: any) => {
        const message = error.response?.data?.error?.message || error.response?.data?.message || t('auth.invalid_credentials', 'Invalid email or password');
        Alert.alert(t('common.error'), message);
      }
    });
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('auth.welcome_back')}</Text>
        <Text style={styles.subtitle}>{t('auth.login_subtitle')}</Text>
      </View>

      <View style={styles.form}>
        {/* Google Sign-In Button - only show when configured */}
        {isGoogleConfigured && (
          <>
            <GoogleSignInButton
              onPress={signInWithGoogle}
              isLoading={isGoogleLoading}
              disabled={!isGoogleReady}
              label={t('auth.continue_google')}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('auth.or')}</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}

        <ControlledInput
          control={control}
          name="email"
          label={t('auth.email')}
          placeholder="alex@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
        />

        <ControlledInput
          control={control}
          name="password"
          label={t('auth.password')}
          placeholder={t('auth.password')} // Using password label as placeholder for now or add specific key
          secureTextEntry
          error={errors.password}
        />

        {/* Forgot Password Link */}
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate('ForgotPassword' as never)}
        >
          <Text style={styles.forgotPasswordText}>{t('auth.forgot_password')}</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.submitButton, isLoggingIn && styles.submitButtonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>{t('auth.login_button')}</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register' as never)}
        >
          <Text style={styles.registerLinkText}>
            {t('auth.no_account').split('?')[0]}?{' '}
            <Text style={styles.registerLinkBold}>{t('auth.register')}</Text>
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#FF6B35',
    fontSize: 14,
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
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 14,
    color: '#666',
  },
  registerLinkBold: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
