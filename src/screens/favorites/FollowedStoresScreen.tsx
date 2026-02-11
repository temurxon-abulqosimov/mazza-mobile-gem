import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator'; // Assuming shared stack or similar
import { colors, spacing, typography } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { Store } from '../../domain/Store';
import { useTranslation } from 'react-i18next';

// We need an API endpoint for this
const getFollowedStores = async () => {
    const { data } = await apiClient.get<{ data: { stores: Store[] } }>('/users/me/followed-stores');
    return data.data.stores;
};

const FollowedStoresScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { data: stores, isLoading, refetch } = useQuery({
        queryKey: ['user', 'followed-stores'],
        queryFn: getFollowedStores,
    });

    const renderStoreItem = ({ item }: { item: Store }) => (
        <TouchableOpacity
            style={styles.storeCard}
            onPress={() => navigation.navigate('StoreProfile', {
                storeId: item.id,
                storeName: item.name,
                storeImage: item.imageUrl,
                storeAddress: item.location.address,
                storeRating: item.rating
            })}
        >
            <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }} style={styles.storeImage} />
            <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{item.name}</Text>
                <Text style={styles.storeAddress} numberOfLines={1}>{item.location.address}</Text>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('favorites.followed_stores')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={stores}
                renderItem={renderStoreItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-outline" size={64} color={colors.text.tertiary} />
                        <Text style={styles.emptyText}>{t('favorites.no_followed_stores')}</Text>
                        <TouchableOpacity style={styles.exploreButton} onPress={() => navigation.navigate('Discovery')}>
                            <Text style={styles.exploreButtonText}>{t('favorites.explore_stores')}</Text>
                        </TouchableOpacity>
                    </View>
                }
                refreshing={isLoading}
                onRefresh={refetch}
            />
        </View>
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
        paddingTop: 60,
        paddingBottom: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        ...typography.h3,
    },
    listContent: {
        padding: spacing.md,
    },
    storeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: spacing.md,
        marginBottom: spacing.md,
        borderRadius: spacing.radiusMd,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    storeImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: spacing.md,
    },
    storeInfo: {
        flex: 1,
    },
    storeName: {
        ...typography.h4,
        marginBottom: 2,
    },
    storeAddress: {
        ...typography.caption,
        color: colors.text.secondary,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        ...typography.caption,
        marginLeft: 4,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        ...typography.body,
        color: colors.text.secondary,
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
    exploreButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xl,
        borderRadius: spacing.radiusLg,
    },
    exploreButtonText: {
        ...typography.button,
        color: 'white',
    },
});

export default FollowedStoresScreen;
