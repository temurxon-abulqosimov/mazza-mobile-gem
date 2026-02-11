import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { storeApi } from '../../api';
import { colors, spacing, typography } from '../../theme';
import Icon from '../../components/ui/Icon';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';

const EditStoreProfileScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation();
    const { userProfile, isLoading: isProfileLoading } = useUserProfile();
    const queryClient = useQueryClient();

    // Store profile state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');

    // Update mutation
    const updateStoreMutation = useMutation({
        mutationFn: storeApi.updateMyStore,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            queryClient.invalidateQueries({ queryKey: ['myStore'] });
            Alert.alert(t('common.success'), t('store_settings.update_success'), [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        },
        onError: (error: any) => {
            console.error('Update store error:', error);
            Alert.alert(t('common.error'), error?.response?.data?.message || t('common.something_went_wrong'));
        }
    });

    useEffect(() => {
        if (userProfile && userProfile.store) {
            setName(userProfile.store.name || '');
            setDescription(userProfile.store.description || '');
            // Check root first (backend format), then location object (frontend format)
            setAddress(userProfile.store.address || userProfile.store.location?.address || '');
            setCity(userProfile.store.city || userProfile.store.location?.city || '');
        } else if (userProfile) {
            // Fallback if store object is not directly on userProfile (depends on backend structure)
            setName(userProfile.businessName || '');
        }
    }, [userProfile]);

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert(t('common.error'), t('store_settings.name_required'));
            return;
        }

        updateStoreMutation.mutate({
            name,
            description,
            address,
            city,
        });
    };

    if (isProfileLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaWrapper>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.container}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('store_settings.edit_business_info')}</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={updateStoreMutation.isPending}
                        style={styles.saveButton}
                    >
                        {updateStoreMutation.isPending ? (
                            <ActivityIndicator size="small" color={colors.primary} />
                        ) : (
                            <Text style={styles.saveText}>{t('common.save')}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Name */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('store_settings.store_name')}</Text>
                        <TextInput
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            placeholder={t('store_settings.store_name_placeholder')}
                            placeholderTextColor={colors.text.tertiary}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('store_settings.description')}</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder={t('store_settings.description_placeholder')}
                            placeholderTextColor={colors.text.tertiary}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Address */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('store_settings.address')}</Text>
                        <TextInput
                            style={styles.input}
                            value={address}
                            onChangeText={setAddress}
                            placeholder={t('store_settings.address_placeholder')}
                            placeholderTextColor={colors.text.tertiary}
                        />
                    </View>

                    {/* City */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>{t('store_settings.city')}</Text>
                        <TextInput
                            style={styles.input}
                            value={city}
                            onChangeText={setCity}
                            placeholder={t('store_settings.city_placeholder')}
                            placeholderTextColor={colors.text.tertiary}
                        />
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        backgroundColor: colors.card,
    },
    backButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        ...typography.h3,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    saveButton: {
        padding: spacing.xs,
    },
    saveText: {
        ...typography.button,
        color: colors.primary,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        ...typography.captionBold,
        color: colors.text.secondary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.radiusMd,
        padding: spacing.md,
        fontSize: 16,
        color: colors.text.primary,
    },
    textArea: {
        minHeight: 100,
    },
});

export default EditStoreProfileScreen;
