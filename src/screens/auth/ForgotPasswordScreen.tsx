import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ControlledInput from '../../components/forms/ControlledInput';
import { authApi } from '../../api';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const forgotPasswordSchema = z.object({
    phoneNumber: z.string().regex(/^998\d{9}$/, { message: 'Telefon raqam 998XXXXXXXXX formatida bo\'lishi kerak' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            phoneNumber: '',
        },
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            await authApi.forgotPassword(data.phoneNumber);
            navigation.navigate('VerifyOtp', { phoneNumber: data.phoneNumber });
        } catch (error: any) {
            const message = error.response?.data?.error?.message || error.response?.data?.message || t('common.error_occurred');
            Alert.alert(t('common.error'), message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('auth.forgot_password')}</Text>
                <Text style={styles.subtitle}>{t('auth.forgot_password_subtitle', 'Enter your phone number to receive a verification code')}</Text>
            </View>

            <View style={styles.form}>
                <ControlledInput
                    control={control}
                    name="phoneNumber"
                    label={t('auth.phone', 'Phone Number')}
                    placeholder="998901234567"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    error={errors.phoneNumber}
                />

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>{t('auth.send_code', 'Send Code')}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>{t('common.back', 'Back to Login')}</Text>
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
    submitButton: {
        backgroundColor: '#FF6B35',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
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
    backButton: {
        marginTop: 16,
        alignItems: 'center',
        padding: 8,
    },
    backButtonText: {
        color: '#666',
        fontSize: 14,
    },
});

export default ForgotPasswordScreen;
