import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../hooks/useAuth';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { registerSchema, RegisterFormData } from '../../domain/validators/AuthValidators';
import ControlledInput from '../../components/forms/ControlledInput';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const RegisterScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { register, isRegistering } = useAuth();
  const { signInWithGoogle, isLoading: isGoogleLoading, isReady: isGoogleReady, isConfigured: isGoogleConfigured } = useGoogleSignIn({
    onSuccess: () => {
      navigation.goBack();
    },
    onError: (error) => {
      console.error('Google Sign-In error:', error);
    },
  });
  const [agreed, setAgreed] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      password: '',
      marketId: '550e8400-e29b-41d4-a716-446655440000',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    if (!agreed) {
      Alert.alert(t('auth.terms_required_title'), t('auth.terms_required_msg'));
      return;
    }

    register(data, {
      onSuccess: () => {
        Alert.alert(t('auth.registration_success_title'), t('auth.registration_success_msg'), [
          {
            text: t('common.close'),
            onPress: () => navigation.goBack(),
          },
        ]);
      },
      onError: (error: any) => {
        const message = error.response?.data?.error?.message || error.response?.data?.message || t('common.error');
        Alert.alert(t('auth.registration_failed_title'), message);
      },
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
      <View style={styles.header}>
        <Text style={styles.title}>{t('auth.create_account')}</Text>
        <Text style={styles.subtitle}>{t('auth.register_subtitle')}</Text>
      </View>

      <View style={styles.form}>
        {/* Google Sign-In Button - only show when configured */}
        {isGoogleConfigured && (
          <>
            <GoogleSignInButton
              onPress={signInWithGoogle}
              isLoading={isGoogleLoading}
              disabled={!isGoogleReady}
              label={t('auth.signup_google')}
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
          name="fullName"
          label={t('auth.full_name')}
          placeholder="Alex Johnson"
          autoCapitalize="words"
          error={errors.fullName}
        />

        <ControlledInput
          control={control}
          name="phoneNumber"
          label={t('auth.phone', 'Phone Number')}
          placeholder="998901234567"
          keyboardType="phone-pad"
          autoCapitalize="none"
          error={errors.phoneNumber}
        />

        <ControlledInput
          control={control}
          name="password"
          label={t('auth.password')}
          placeholder={t('auth.password')}
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
            {t('auth.terms_agree')}{' '}
            <Text style={styles.link}>{t('auth.terms_conditions')}</Text>
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
            <Text style={styles.submitButtonText}>{t('auth.create_account')}</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login' as never)}
        >
          <Text style={styles.loginLinkText}>
            {t('auth.have_account').split('?')[0]}?{' '}
            <Text style={styles.loginLinkBold}>{t('auth.login')}</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
