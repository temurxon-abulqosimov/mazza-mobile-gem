import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useSeller } from '../../hooks/useSeller';
import { sellerApplicationSchema, SellerApplicationFormData } from '../../domain/validators/SellerValidators';
import ControlledInput from '../../components/forms/ControlledInput';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'BecomeSeller'>;

const BecomeSellerScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { control, handleSubmit, setValue, formState: { errors } } = useForm<SellerApplicationFormData>({
        resolver: zodResolver(sellerApplicationSchema),
        defaultValues: {
            lat: 40.7128,
            lng: -74.0060,
        }
    });
    const { applyAsSeller, isApplying } = useSeller();
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        setIsGettingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
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
                const fullAddress = [addressResult.street, addressResult.streetNumber].filter(Boolean).join(' ');
                if (fullAddress) setValue('address', fullAddress);
                if (addressResult.city) setValue('city', addressResult.city);
            }
        } catch (error) {
            console.error('Location error:', error);
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
            const message = error.response?.data?.error?.message?.join(', ') || error.message || 'Something went wrong.';
            Alert.alert('Application Failed', message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Become a Seller</Text>
            <Text style={styles.subtitle}>Join our community of sellers!</Text>

            <ControlledInput name="businessName" label="Business Name" control={control} error={errors.businessName} />
            <ControlledInput name="description" label="Description" control={control} error={errors.description} multiline numberOfLines={4} />
            <ControlledInput name="address" label="Address" control={control} error={errors.address} />
            <ControlledInput name="city" label="City" control={control} error={errors.city} />

            <View style={styles.locationSection}>
                <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation} disabled={isGettingLocation}>
                    {isGettingLocation ? <ActivityIndicator color="#FF6B35" /> : <Text style={styles.locationButtonText}>📍 Use Current Location</Text>}
                </TouchableOpacity>
            </View>

            <ControlledInput name="phone" label="Phone (Optional)" control={control} error={errors.phone} keyboardType="phone-pad" />

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
    submitButton: { backgroundColor: '#FF6B35', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 40 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default BecomeSellerScreen;
