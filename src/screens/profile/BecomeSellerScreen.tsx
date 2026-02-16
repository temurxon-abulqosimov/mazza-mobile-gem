import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useSeller } from '../../hooks/useSeller';
import { sellerApplicationSchema, SellerApplicationFormData } from '../../domain/validators/SellerValidators';
import ControlledInput from '../../components/forms/ControlledInput';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';

import { getCategories } from '../../api/categories';
import { Category } from '../../domain/Category';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'BecomeSeller'>;

const STORE_TYPE_ICONS: Record<string, string> = {
    bakery: '🍞',
    cafe: '☕',
    desserts: '🍰',
    'fast-food': '🍔',
    grocery: '🛒',
    restaurant: '🍽️',
    supermarket: '🏪',
    pharmacy: '💊',
    default: '🏬',
};

const getStoreTypeIcon = (name: string, slug?: string): string => {
    const key = (slug || name || '').toLowerCase().replace(/\s+/g, '-');
    return STORE_TYPE_ICONS[key] || STORE_TYPE_ICONS.default;
};

const BecomeSellerScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavigationProp>();
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<SellerApplicationFormData>({
        resolver: zodResolver(sellerApplicationSchema),
        defaultValues: {
            businessName: '',
            description: '',
            address: '',
            city: '',
            phone: '',
            categoryId: '' as any,
            lat: 0,
            lng: 0,
        },
    });
    const { applyAsSeller, isApplying } = useSeller();
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationObtained, setLocationObtained] = useState(false);

    // Category State
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
    const selectedCategoryId = watch('categoryId');
    const lat = watch('lat');
    const lng = watch('lng');

    useEffect(() => {
        getCurrentLocation();
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await getCategories();
            if (data && data.categories && Array.isArray(data.categories)) {
                setCategories(data.categories);
            }
        } catch (error) {
            console.error('Failed to load categories', error);
            Alert.alert(t('common.error'), t('become_seller.categories_load_failed', 'Failed to load categories'));
        } finally {
            setIsCategoriesLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        setIsGettingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(
                    t('become_seller.location_permission_required'),
                    t('become_seller.location_permission_msg'),
                    [{ text: t('common.ok') }]
                );
                setIsGettingLocation(false);
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setValue('lat', location.coords.latitude);
            setValue('lng', location.coords.longitude);

            const [addressResult] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            if (addressResult) {
                const fullAddress = [addressResult.street, addressResult.streetNumber, addressResult.district].filter(Boolean).join(' ');
                if (fullAddress) {
                    setValue('address', fullAddress);
                } else if (addressResult.name) {
                    setValue('address', addressResult.name);
                }
                if (addressResult.city) {
                    setValue('city', addressResult.city);
                } else if (addressResult.subregion) {
                    setValue('city', addressResult.subregion);
                }
            }

            setLocationObtained(true);
        } catch (error) {
            console.error('Location error:', error);
            Alert.alert(
                t('become_seller.location_error', 'Location Error'),
                t('become_seller.location_error_msg', 'Could not get your location. Please enter address manually.'),
                [{ text: t('common.ok') }]
            );
        } finally {
            setIsGettingLocation(false);
        }
    };

    const onValidationError = (formErrors: any) => {
        const firstError = Object.values(formErrors)[0] as any;
        const message = firstError?.message || t('common.error');
        Alert.alert(t('common.error'), message);
    };

    const onSubmit = async (data: SellerApplicationFormData) => {
        if (!locationObtained) {
            Alert.alert(t('common.error'), t('become_seller.location_required', 'Please set your store location first'));
            return;
        }
        try {
            await applyAsSeller(data);
            Alert.alert(
                t('become_seller.application_submitted', 'Application Submitted!'),
                t('become_seller.application_submitted_msg', 'Your seller application has been submitted. We will review it shortly.'),
                [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error?.message?.join(', ') || error.message || 'Something went wrong.';
            Alert.alert(t('become_seller.application_failed', 'Submission Failed'), message);
        }
    };

    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>🏪</Text>
                <Text style={styles.title}>{t('become_seller.title', 'Become a Seller')}</Text>
                <Text style={styles.subtitle}>{t('become_seller.subtitle', 'Join our community of sellers!')}</Text>
            </View>

            {/* Step 1: Store Type */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    <Text style={styles.stepBadge}>1</Text>  {t('become_seller.select_category', 'Store Type')}
                </Text>
                {isCategoriesLoading ? (
                    <ActivityIndicator color="#FF6B35" size="small" style={{ marginVertical: 20 }} />
                ) : (
                    <View style={styles.categoryContainer}>
                        {categories.map((cat) => {
                            const isSelected = selectedCategoryId === cat.id;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                                    onPress={() => setValue('categoryId', cat.id, { shouldValidate: true })}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.categoryChipIcon}>
                                        {getStoreTypeIcon(cat.name, cat.slug)}
                                    </Text>
                                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                                        {cat.name}
                                    </Text>
                                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
                {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId.message}</Text>}
            </View>

            {/* Step 2: Business Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    <Text style={styles.stepBadge}>2</Text>  {t('become_seller.business_info', 'Business Info')}
                </Text>
                <ControlledInput
                    name="businessName"
                    label={t('become_seller.business_name', 'Business Name')}
                    placeholder={t('become_seller.business_name_placeholder', 'e.g. Fresh Bakery')}
                    control={control}
                    error={errors.businessName}
                />
                <ControlledInput
                    name="description"
                    label={t('become_seller.description', 'Description')}
                    placeholder={t('become_seller.description_placeholder', 'Tell customers about your business...')}
                    control={control}
                    error={errors.description}
                    multiline
                    numberOfLines={3}
                />
                <ControlledInput
                    name="phone"
                    label={t('become_seller.phone', 'Business Phone')}
                    placeholder="998901234567"
                    control={control}
                    error={errors.phone}
                    keyboardType="phone-pad"
                />
            </View>

            {/* Step 3: Location */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    <Text style={styles.stepBadge}>3</Text>  {t('become_seller.location', 'Location')}
                </Text>

                <TouchableOpacity
                    style={[styles.locationButton, locationObtained && styles.locationButtonObtained]}
                    onPress={getCurrentLocation}
                    disabled={isGettingLocation}
                    activeOpacity={0.7}
                >
                    {isGettingLocation ? (
                        <ActivityIndicator color="#FF6B35" />
                    ) : (
                        <>
                            <Text style={styles.locationButtonIcon}>{locationObtained ? '✅' : '📍'}</Text>
                            <Text style={[styles.locationButtonText, locationObtained && styles.locationButtonTextObtained]}>
                                {locationObtained
                                    ? t('become_seller.location_detected', 'Location detected')
                                    : t('become_seller.use_current_location', 'Detect my location')}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
                {locationObtained && lat !== 0 && lng !== 0 && (
                    <Text style={styles.locationCoords}>
                        📌 {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
                    </Text>
                )}

                <ControlledInput
                    name="address"
                    label={t('become_seller.address', 'Address')}
                    placeholder={t('become_seller.address_placeholder', 'Street name, building number')}
                    control={control}
                    error={errors.address}
                />
                <ControlledInput
                    name="city"
                    label={t('become_seller.city', 'City')}
                    placeholder={t('become_seller.city_placeholder', 'e.g. Tashkent')}
                    control={control}
                    error={errors.city}
                />
            </View>

            {/* Submit */}
            <TouchableOpacity
                style={[styles.submitButton, isApplying && styles.submitButtonDisabled]}
                onPress={handleSubmit(onSubmit, onValidationError)}
                disabled={isApplying}
                activeOpacity={0.8}
            >
                {isApplying ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.submitButtonText}>{t('become_seller.submit', 'Submit Application')}</Text>
                )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 15,
        color: '#888',
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 14,
    },
    stepBadge: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF6B35',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 24,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#EBEBEB',
    },
    categoryChipSelected: {
        backgroundColor: '#FFF2EC',
        borderColor: '#FF6B35',
    },
    categoryChipIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#555',
    },
    categoryChipTextSelected: {
        color: '#FF6B35',
        fontWeight: '700',
    },
    checkMark: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FF6B35',
        marginLeft: 6,
    },
    errorText: {
        color: '#E53E3E',
        fontSize: 12,
        marginTop: 6,
    },
    locationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F2',
        borderColor: '#FFD4C2',
        borderWidth: 1.5,
        borderRadius: 12,
        paddingVertical: 14,
        marginBottom: 12,
    },
    locationButtonObtained: {
        backgroundColor: '#F0FFF4',
        borderColor: '#C6F6D5',
    },
    locationButtonIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    locationButtonText: {
        color: '#FF6B35',
        fontSize: 15,
        fontWeight: '600',
    },
    locationButtonTextObtained: {
        color: '#38A169',
    },
    locationCoords: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginBottom: 12,
    },
    submitButton: {
        backgroundColor: '#FF6B35',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
        marginHorizontal: 16,
        marginTop: 8,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default BecomeSellerScreen;
