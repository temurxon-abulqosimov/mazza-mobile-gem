import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

const FavoritesHeader = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.title}>Favorites</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarButton}>
                <View style={styles.avatar}>
                    {/* Placeholder for user avatar */}
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 12,
        backgroundColor: '#FCFCFC',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 60,
        zIndex: 1,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    avatarButton: {
        position: 'absolute',
        right: 16,
        top: 56,
        zIndex: 1,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E0E0E0',
    },
});

export default FavoritesHeader;
