import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ControlledInput from '../../components/forms/ControlledInput';
import { authApi } from '../../api';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const verifyOtpSchema = z.object({
    otp: z.string().length(6, { message: 'OTP must be 6 digits' }),
});

type VerifyOtpFormData = z.infer<typeof verifyOtpSchema>;

const VerifyOtpScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const route = useRoute();
    const { phoneNumber } = route.params as { phoneNumber: string };
    const [isLoading, setIsLoading] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<VerifyOtpFormData>({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: {
            otp: '',
        },
    });

    const onSubmit = async (data: VerifyOtpFormData) => {
        setIsLoading(true);
        try {
            await authApi.verifyOtp(phoneNumber, data.otp);
            navigation.navigate('ResetPassword', { phoneNumber, otp: data.otp });
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
                <Text style={styles.title}>{t('auth.verify_otp', 'Enter Code')}</Text>
                <Text style={styles.subtitle}>{t('auth.verify_otp_subtitle', 'Enter the 6-digit code sent to')} {phoneNumber}</Text>
            </View>

            <View style={styles.form}>
                <ControlledInput
                    control={control}
                    name="otp"
                    label={t('auth.otp', 'Verification Code')}
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    error={errors.otp}
                />

                <TouchableOpacity
                    style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitButtonText}>{t('auth.verify', 'Verify')}</Text>
                    )}
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
});

export default VerifyOtpScreen;
