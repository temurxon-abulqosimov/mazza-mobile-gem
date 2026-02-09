import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useSeller } from '../../hooks/useSeller';
import { sellerApplicationSchema, SellerApplicationFormData } from '../../domain/validators/SellerValidators';
import ControlledInput from '../../components/forms/ControlledInput';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';

import { getCategories } from '../../api/categories';
import { Category } from '../../domain/Category';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'BecomeSeller'>;

const BecomeSellerScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<SellerApplicationFormData>({
        resolver: zodResolver(sellerApplicationSchema),
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
            // data.categories is the array
            if (data && Array.isArray(data)) { // Check if data itself is array or data.categories
                // api/categories says returns data.data which is { categories: [] } ?
                // checking api/categories.ts: return data.data; // Backend returns {..., data: { categories: [...] } }
                // Wait, getCategories return type is Promise<{ categories: Category[] }>
                setCategories(data.categories || []);
            }
        } catch (error) {
            console.error('Failed to load categories', error);
            Alert.alert('Error', 'Failed to load business categories.');
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
                    'Location Permission Required',
                    'Please enable location permission to automatically fill your business address. You can also enter it manually.',
                    [{ text: 'OK' }]
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
            Alert.alert('Success', 'Location obtained! Please verify the address and city fields.');
        } catch (error) {
            console.error('Location error:', error);
            Alert.alert(
                'Location Error',
                'Could not get your location. Please enter your business address manually.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsGettingLocation(false);
        }
    };

    const onSubmit = async (data: SellerApplicationFormData) => {
        try {
            await applyAsSeller(data);
            Alert.alert(
                'Application Submitted',
                'Thank you! Your application is under review.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error('Seller application error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            const message = error.response?.data?.message || error.response?.data?.error?.message?.join(', ') || error.message || 'Something went wrong.';
            Alert.alert('Application Failed', message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Become a Seller</Text>
            <Text style={styles.subtitle}>Join our community of sellers!</Text>

            <Text style={styles.label}>Select Business Category</Text>
            {isCategoriesLoading ? (
                <ActivityIndicator color="#FF6B35" size="small" style={{ alignSelf: 'flex-start', marginBottom: 16 }} />
            ) : (
                <View style={styles.categoryContainer}>
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.categoryCard,
                                selectedCategoryId === cat.id && styles.categoryCardSelected
                            ]}
                            onPress={() => setValue('categoryId', cat.id, { shouldValidate: true })}
                        >
                            {/* Handle icon being URL or emoji */}
                            {cat.icon?.startsWith('http') ? (
                                <Image source={{ uri: cat.icon }} style={styles.categoryImage} />
                            ) : (
                                <Text style={styles.categoryIcon}>{cat.icon || '📦'}</Text>
                            )}
                            <Text style={[
                                styles.categoryName,
                                selectedCategoryId === cat.id && styles.categoryNameSelected
                            ]}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
            {errors.categoryId && <Text style={styles.errorText}>{errors.categoryId.message}</Text>}

            <ControlledInput name="businessName" label="Business Name" control={control} error={errors.businessName} />
            <ControlledInput name="description" label="Description" control={control} error={errors.description} multiline numberOfLines={4} />
            <ControlledInput name="address" label="Address" control={control} error={errors.address} />
            <ControlledInput name="city" label="City" control={control} error={errors.city} />

            <View style={styles.locationSection}>
                <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation} disabled={isGettingLocation}>
                    {isGettingLocation ? <ActivityIndicator color="#FF6B35" /> : <Text style={styles.locationButtonText}>📍 {locationObtained ? 'Update Location' : 'Use Current Location'}</Text>}
                </TouchableOpacity>
                {locationObtained && lat && lng && (
                    <Text style={styles.locationInfo}>
                        ✓ Location: {lat.toFixed(6)}, {lng.toFixed(6)}
                    </Text>
                )}
            </View>

            <ControlledInput name="phone" label="Phone Number" control={control} error={errors.phone} keyboardType="phone-pad" />

            {isApplying ? (
                <ActivityIndicator size="large" color="#FF6B35" />
            ) : (
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.submitButtonText}>Submit Application</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 24 },
    locationSection: { marginBottom: 16 },
    locationButton: { backgroundColor: '#FFF5F2', borderColor: '#FF6B35', borderWidth: 1, borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
    locationButtonText: { color: '#FF6B35', fontSize: 16, fontWeight: '600' },
    locationInfo: { marginTop: 8, fontSize: 12, color: '#28a745', textAlign: 'center' },
    submitButton: { backgroundColor: '#FF6B35', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 40 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
    categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
    categoryCard: { width: '48%', backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
    categoryCardSelected: { backgroundColor: '#FFF5F2', borderColor: '#FF6B35' },
    categoryIcon: { fontSize: 32, marginBottom: 8 },
    categoryImage: { width: 50, height: 50, borderRadius: 25, marginBottom: 8 },
    categoryName: { fontSize: 14, color: '#666', textAlign: 'center', fontWeight: '500' },
    categoryNameSelected: { color: '#FF6B35', fontWeight: 'bold' },
    errorText: { color: 'red', fontSize: 12, marginBottom: 12 },
});

export default BecomeSellerScreen;
