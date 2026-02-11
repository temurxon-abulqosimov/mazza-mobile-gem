import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image, Linking } from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme';
import { updateMe } from '../../api/users';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useLocation } from '../../hooks/useLocation';

/**
 * LocationOnboardingScreen
 * 
 * Forces the user to set their location before accessing the main app.
 * Utilizes robust LocationService to fetch coordinates with timeouts/fallbacks.
 */
const LocationOnboardingScreen = () => {
    const { t } = useTranslation();
    const { getLocation, requestPermissions, isLoading, error } = useLocation();
    const { refetch } = useUserProfile();

    const handleUseCurrentLocation = async () => {
        Alert.alert(
            t('location_onboarding.permission_title'),
            t('location_onboarding.permission_msg'),
            [
                {
                    text: t('common.cancel'),
                    style: "cancel"
                },
                {
                    text: t('common.ok'),
                    onPress: async () => {
                        try {
                            // 1. Request Permissions
                            const granted = await requestPermissions();

                            if (!granted) {
                                Alert.alert(
                                    t('discovery.permission_denied'),
                                    t('location_onboarding.permission_denied_msg'),
                                    [
                                        { text: t('common.cancel'), style: 'cancel' },
                                        { text: t('discovery.open_settings'), onPress: () => Linking.openSettings() }
                                    ]
                                );
                                return;
                            }

                            // 2. Get Location (with timeout & fallback)
                            const location = await getLocation();

                            if (!location) {
                                Alert.alert(t('become_seller.location_error'), t('location_onboarding.location_error_msg'));
                                return;
                            }

                            const { latitude, longitude } = location.coords;

                            // 3. Update User Profile
                            await updateMe({
                                lat: latitude,
                                lng: longitude
                            });

                            // 4. Refetch profile to trigger navigation
                            await refetch();

                        } catch (err) {
                            console.error('Location Onboarding Error:', err);
                            Alert.alert(t('common.error'), t('location_onboarding.save_error'));
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Text style={{ fontSize: 60 }}>📍</Text>
                </View>

                <Text style={styles.title}>{t('location_onboarding.enable_location')}</Text>
                <Text style={styles.description}>
                    {t('location_onboarding.description')}
                </Text>

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleUseCurrentLocation}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.text.inverse} />
                    ) : (
                        <Text style={styles.buttonText}>{t('location_onboarding.use_current_location')}</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.manualButton}
                    onPress={() => Alert.alert(t('settings.coming_soon'), t('location_onboarding.coming_soon_msg'))}
                    disabled={isLoading}
                >
                    <Text style={styles.manualButtonText}>{t('location_onboarding.enter_manually')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primaryBackground,
        justifyContent: 'center',
        padding: spacing.xl,
    },
    content: {
        backgroundColor: colors.surface,
        borderRadius: spacing.radiusXxl,
        padding: spacing.xxl,
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    iconContainer: {
        marginBottom: spacing.xl,
        backgroundColor: colors.primaryBackground,
        padding: spacing.lg,
        borderRadius: spacing.radiusFull,
    },
    title: {
        ...typography.h2,
        color: colors.text.primary,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    description: {
        ...typography.body,
        color: colors.text.secondary,
        textAlign: 'center',
        marginBottom: spacing.xxxl,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.radiusLg,
        width: '100%',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    buttonText: {
        ...typography.buttonLarge,
        color: colors.text.inverse,
    },
    manualButton: {
        paddingVertical: spacing.md,
    },
    manualButtonText: {
        ...typography.button,
        color: colors.text.secondary,
    },
});

export default LocationOnboardingScreen;
