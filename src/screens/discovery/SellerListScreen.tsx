import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDiscovery } from '../../hooks/useDiscovery';
import { useLocation } from '../../hooks/useLocation';
import { colors, spacing, typography } from '../../theme';
import Icon from '../../components/ui/Icon';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { SellerCard } from '../../components/discovery/SellerCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { DiscoveryStackParamList } from '../../navigation/types';
import { DEFAULT_LOCATION } from '../../constants/location';

type DiscoveryScreenNavigationProp = NativeStackNavigationProp<DiscoveryStackParamList>;

const SellerListScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<DiscoveryScreenNavigationProp>();
    const insets = useSafeAreaInsets();

    // Get location — always fall back to DEFAULT_LOCATION so the query fires immediately
    const { location } = useLocation();
    const effectiveLocation = location || DEFAULT_LOCATION;
    const lat = effectiveLocation.coords.latitude;
    const lng = effectiveLocation.coords.longitude;

    // Use the same discovery hook as DiscoveryScreen and extract unique sellers
    const {
        products,
        isLoading,
        refetch,
        isRefetching,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useDiscovery({
        lat,
        lng,
        radius: 50,
        enabled: true,
    });

    // Extract unique stores from products — same logic as DiscoveryScreen
    const stores = useMemo(() => {
        if (!products) return [];
        const uniqueStores = new Map<string, any>();
        products.forEach((product: any) => {
            if (!product.store) return;
            const existing = uniqueStores.get(product.store.id);
            if (!existing) {
                uniqueStores.set(product.store.id, {
                    id: product.store.id,
                    name: product.store.name,
                    imageUrl: product.store.imageUrl,
                    category: 'Store',
                    rating: product.store.rating || 0,
                    distance: product.distance || 0,
                    address: product.store.location?.address || 'Unknown Address',
                    location: product.store.location,
                    products: [product],
                });
            } else {
                if (!existing.products.find((p: any) => p.id === product.id)) {
                    existing.products.push(product);
                }
            }
        });
        return Array.from(uniqueStores.values());
    }, [products]);

    const handleStorePress = (store: any) => {
        navigation.navigate('StoreProfile', {
            storeId: store.id,
            storeName: store.name,
            storeImage: store.imageUrl,
            storeAddress: store.location?.address || 'Unknown Address', // Handle StoreLocation object or string
            storeRating: store.rating,
        });
    };

    const handleProductPress = (productId: string) => {
        navigation.navigate('ProductDetail', { productId });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>{t('discovery.nearby_sellers')}</Text>
            <View style={{ width: 40 }} />
        </View>
    );

    return (
        <SafeAreaWrapper>
            {renderHeader()}
            <FlatList
                data={stores}
                renderItem={({ item }) => (
                    <View style={styles.cardWrapper}>
                        <SellerCard
                            seller={item}
                            onPress={() => handleStorePress(item)}
                            onProductPress={handleProductPress}
                            fullWidth
                        />
                    </View>
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
                }
                onEndReached={() => {
                    if (hasNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={colors.primary} style={{ padding: 16 }} /> : null}
                ListEmptyComponent={
                    !isLoading ? (
                        <EmptyState
                            icon="store"
                            title={t('discovery.no_sellers')}
                            subtitle={t('discovery.no_sellers_subtitle')}
                        />
                    ) : (
                        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                    )
                }
            />
        </SafeAreaWrapper>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        backgroundColor: colors.card,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        ...typography.h3,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    listContent: {
        padding: spacing.md,
    },
    cardWrapper: {
        marginBottom: spacing.md,
    },
});

export default SellerListScreen;
