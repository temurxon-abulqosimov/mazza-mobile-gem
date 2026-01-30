import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSeller } from '../../hooks/useSeller';
import { sellerApplicationSchema, SellerApplicationFormData } from '../../domain/validators/SellerValidators';
import ControlledInput from '../../components/forms/ControlledInput';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'BecomeSeller'>;

const BecomeSellerScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { control, handleSubmit, formState: { errors } } = useForm<SellerApplicationFormData>({
        resolver: zodResolver(sellerApplicationSchema)
    });
    const { applyAsSeller, isApplying } = useSeller();

    const onSubmit = async (data: SellerApplicationFormData) => {
        try {
            await applyAsSeller(data);
            Alert.alert(
                'Application Submitted',
                'Thank you! Your application is under review. We will get back to you soon.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error: any) {
            console.error('Seller application error:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            const message = error.response?.data?.message || error.message || 'Something went wrong.';
            Alert.alert('Application Failed', message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Become a Seller</Text>
            <Text style={styles.subtitle}>Join our community of sellers and start rescuing food today!</Text>

            <ControlledInput name="businessName" label="Business Name" control={control} error={errors.businessName} />
            <ControlledInput name="businessType" label="Business Type (e.g., Restaurant, Cafe)" control={control} error={errors.businessType} />
            <ControlledInput name="description" label="Short Description" control={control} error={errors.description} multiline numberOfLines={4} />
            <ControlledInput name="phoneNumber" label="Phone Number" control={control} error={errors.phoneNumber} keyboardType="phone-pad"/>

            {isApplying 
                ? <ActivityIndicator size="large" /> 
                : <Button title="Submit Application" onPress={handleSubmit(onSubmit)} />
            }
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
    }
});

export default BecomeSellerScreen;
