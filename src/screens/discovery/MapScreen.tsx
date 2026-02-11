import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator';
import { useDiscovery } from '../../hooks/useDiscovery';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, typography } from '../../theme';
import { Product } from '../../domain/Product';
import { Store } from '../../domain/Store';
import { ProductImage } from '../../components/ui/ProductImage';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;
const CARD_SPACING = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

// Muted green map style for a clean look
const MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5f5e0' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8f5' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
];

interface StoreWithProducts {
    store: Store;
    products: Product[];
    totalDiscount: number;
}

const MapScreen = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NativeStackNavigationProp<DiscoveryStackParamList>>();
    const insets = useSafeAreaInsets();
    const mapRef = useRef<MapView>(null);
    const flatListRef = useRef<FlatList>(null);
    const markerScaleAnim = useRef(new Animated.Value(1)).current;

    const [region, setRegion] = useState<Region>({
        latitude: 41.2995,
        longitude: 69.2401,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
    });
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
    const [showCards, setShowCards] = useState(true);

    const { products, isLoading } = useDiscovery({
        lat: region.latitude,
        lng: region.longitude,
        radius: 10000,
    });

    // Group products by store — each store becomes a pin
    const storeGroups = useMemo<StoreWithProducts[]>(() => {
        if (!products?.length) return [];
        const map = new Map<string, StoreWithProducts>();
        for (const p of products) {
            const sid = p.store.id;
            if (!map.has(sid)) {
                const discount = p.originalPrice > 0
                    ? Math.round((1 - p.discountedPrice / p.originalPrice) * 100)
                    : 0;
                map.set(sid, { store: p.store, products: [p], totalDiscount: discount });
            } else {
                map.get(sid)!.products.push(p);
            }
        }
        return Array.from(map.values());
    }, [products]);

    // Get user location on mount
    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') return;
                const loc = await Location.getCurrentPositionAsync({});
                const newRegion = {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                };
                setRegion(newRegion);
                setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
            } catch {
                // keep default
            }
        })();
    }, []);

    const animateToStore = useCallback((store: Store) => {
        mapRef.current?.animateToRegion(
            {
                latitude: store.location.lat - 0.003, // offset so pin is slightly above center, card visible below
                longitude: store.location.lng,
                latitudeDelta: 0.012,
                longitudeDelta: 0.012,
            },
            400,
        );
    }, []);

    const handleMarkerPress = useCallback(
        (group: StoreWithProducts, index: number) => {
            setSelectedStoreId(group.store.id);
            setShowCards(true);
            flatListRef.current?.scrollToIndex({ index, animated: true });
            animateToStore(group.store);

            // bounce animation
            Animated.sequence([
                Animated.timing(markerScaleAnim, { toValue: 1.3, duration: 150, useNativeDriver: true }),
                Animated.timing(markerScaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
        },
        [animateToStore, markerScaleAnim],
    );

    const onCardScroll = useCallback(
        (event: any) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
            if (storeGroups[index]) {
                setSelectedStoreId(storeGroups[index].store.id);
                animateToStore(storeGroups[index].store);
            }
        },
        [storeGroups, animateToStore],
    );

    const recenterMap = useCallback(() => {
        if (userLocation) {
            mapRef.current?.animateToRegion(
                {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng,
                    latitudeDelta: 0.04,
                    longitudeDelta: 0.04,
                },
                500,
            );
        }
    }, [userLocation]);

    // ─────────────────── Store Card ───────────────────
    const renderStoreCard = useCallback(
        ({ item }: { item: StoreWithProducts }) => {
            const { store, products: storeProducts } = item;
            const cheapest = storeProducts.reduce((min, p) =>
                p.discountedPrice < min.discountedPrice ? p : min, storeProducts[0]);
            const totalItems = storeProducts.reduce((sum, p) => sum + p.quantityAvailable, 0);
            const avgDiscount = storeProducts.length > 0
                ? Math.round(storeProducts.reduce((sum, p) => {
                    return sum + (p.originalPrice > 0 ? (1 - p.discountedPrice / p.originalPrice) * 100 : 0);
                }, 0) / storeProducts.length)
                : 0;

            return (
                <TouchableOpacity
                    activeOpacity={0.95}
                    onPress={() => navigation.navigate('ProductDetail', { productId: cheapest.id })}
                    style={styles.cardOuter}
                >
                    <View style={styles.card}>
                        {/* Store image */}
                        <ProductImage
                            imageUrl={store.imageUrl || cheapest.images?.[0]?.url}
                            categorySlug={cheapest.category?.slug}
                            style={styles.cardImage}
                        />

                        {/* Discount badge on image */}
                        {avgDiscount > 0 && (
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountText}>-{avgDiscount}%</Text>
                            </View>
                        )}

                        {/* Info */}
                        <View style={styles.cardBody}>
                            {/* Store name + rating */}
                            <View style={styles.cardTopRow}>
                                <Text style={styles.cardStoreName} numberOfLines={1}>
                                    {store.name}
                                </Text>
                                <View style={styles.ratingPill}>
                                    <Ionicons name="star" size={12} color="#FFA000" />
                                    <Text style={styles.ratingValue}>{store.rating?.toFixed(1) || '4.8'}</Text>
                                </View>
                            </View>

                            {/* Address */}
                            <View style={styles.addressRow}>
                                <Ionicons name="location-outline" size={13} color={colors.text.tertiary} />
                                <Text style={styles.cardAddress} numberOfLines={1}>
                                    {store.location?.address || 'Nearby'}
                                </Text>
                            </View>

                            {/* Stats row */}
                            <View style={styles.statsRow}>
                                <View style={styles.statChip}>
                                    <Ionicons name="pricetag-outline" size={13} color={colors.primary} />
                                    <Text style={styles.statText}>
                                        {t('discovery.from', 'From')} ${(cheapest.discountedPrice / 100).toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.statChip}>
                                    <Ionicons name="cube-outline" size={13} color={colors.secondary} />
                                    <Text style={styles.statText}>
                                        {storeProducts.length} {t('discovery.items', 'items')}
                                    </Text>
                                </View>
                                {totalItems <= 5 && (
                                    <View style={[styles.statChip, styles.urgentChip]}>
                                        <Ionicons name="flame-outline" size={13} color={colors.error} />
                                        <Text style={[styles.statText, { color: colors.error }]}>
                                            {totalItems} {t('discovery.left', 'left')}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Chevron */}
                        <View style={styles.chevronContainer}>
                            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        },
        [navigation, t],
    );

    // ─────────────────── Custom Marker ───────────────────
    const renderMarker = useCallback(
        (group: StoreWithProducts, index: number) => {
            const isSelected = selectedStoreId === group.store.id;
            const itemCount = group.products.length;
            return (
                <Marker
                    key={group.store.id}
                    coordinate={{
                        latitude: group.store.location.lat,
                        longitude: group.store.location.lng,
                    }}
                    onPress={() => handleMarkerPress(group, index)}
                    tracksViewChanges={false}
                >
                    <View style={styles.markerWrapper}>
                        {/* Pin body */}
                        <View style={[styles.pin, isSelected && styles.pinSelected]}>
                            <Ionicons
                                name="storefront"
                                size={isSelected ? 20 : 16}
                                color={isSelected ? '#fff' : colors.primary}
                            />
                            {itemCount > 1 && (
                                <View style={[styles.pinCount, isSelected && styles.pinCountSelected]}>
                                    <Text style={styles.pinCountText}>{itemCount}</Text>
                                </View>
                            )}
                        </View>
                        {/* Pin pointer */}
                        <View style={[styles.pinPointer, isSelected && styles.pinPointerSelected]} />
                    </View>
                </Marker>
            );
        },
        [selectedStoreId, handleMarkerPress],
    );

    // ─────────────────── Render ───────────────────
    return (
        <View style={styles.container}>
            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={region}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass={false}
                customMapStyle={MAP_STYLE}
                mapPadding={{ top: 0, right: 0, bottom: 200, left: 0 }}
            >
                {/* Radius circle around user */}
                {userLocation && (
                    <Circle
                        center={{ latitude: userLocation.lat, longitude: userLocation.lng }}
                        radius={1500}
                        fillColor="rgba(76, 175, 80, 0.06)"
                        strokeColor="rgba(76, 175, 80, 0.15)"
                        strokeWidth={1}
                    />
                )}

                {storeGroups.map((group, index) => renderMarker(group, index))}
            </MapView>

            {/* Top gradient for status bar */}
            <LinearGradient
                colors={['rgba(255,255,255,0.95)', 'rgba(255,255,255,0)']}
                style={[styles.topGradient, { height: insets.top + 16 }]}
                pointerEvents="none"
            />

            {/* Header controls */}
            <View style={[styles.headerRow, { top: insets.top + 8 }]}>
                {/* Store count */}
                <View style={styles.storeBadge}>
                    <Ionicons name="storefront-outline" size={16} color={colors.primary} />
                    <Text style={styles.storeBadgeText}>
                        {storeGroups.length} {storeGroups.length === 1 ? t('discovery.store', 'store') : t('discovery.stores', 'stores')}
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    {/* Toggle cards */}
                    <TouchableOpacity
                        style={styles.controlBtn}
                        onPress={() => setShowCards(!showCards)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name={showCards ? 'list-outline' : 'map-outline'} size={20} color={colors.text.primary} />
                    </TouchableOpacity>

                    {/* Recenter */}
                    <TouchableOpacity style={styles.controlBtn} onPress={recenterMap} activeOpacity={0.7}>
                        <Ionicons name="navigate" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Loading spinner */}
            {isLoading && (
                <View style={styles.loadingPill}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.loadingText}>{t('common.loading', 'Finding stores...')}</Text>
                </View>
            )}

            {/* Empty state */}
            {!isLoading && storeGroups.length === 0 && (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyCard}>
                        <Ionicons name="search-outline" size={32} color={colors.text.tertiary} />
                        <Text style={styles.emptyTitle}>{t('discovery.no_stores', 'No stores nearby')}</Text>
                        <Text style={styles.emptySubtitle}>
                            {t('discovery.try_zoom_out', 'Try zooming out or moving the map')}
                        </Text>
                    </View>
                </View>
            )}

            {/* Bottom Carousel */}
            {showCards && storeGroups.length > 0 && (
                <View style={[styles.carouselContainer, { bottom: Platform.OS === 'ios' ? insets.bottom + 70 : 68 }]}>
                    <FlatList
                        ref={flatListRef}
                        data={storeGroups}
                        renderItem={renderStoreCard}
                        keyExtractor={(item) => item.store.id}
                        horizontal
                        snapToInterval={SNAP_INTERVAL}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 }}
                        onMomentumScrollEnd={onCardScroll}
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },

    // ── Top gradient & controls ──
    topGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
    headerRow: {
        position: 'absolute',
        left: 16,
        right: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fff',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    storeBadgeText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    controlBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },

    // ── Loading ──
    loadingPill: {
        position: 'absolute',
        top: '50%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 4,
    },
    loadingText: {
        fontSize: 14,
        color: colors.text.secondary,
        fontWeight: '500',
    },

    // ── Empty state ──
    emptyContainer: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    emptyCard: {
        backgroundColor: '#fff',
        paddingHorizontal: 32,
        paddingVertical: 28,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text.primary,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.text.tertiary,
        marginTop: 4,
        textAlign: 'center',
    },

    // ── Custom Marker / Pin ──
    markerWrapper: {
        alignItems: 'center',
    },
    pin: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    pinSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primaryDark,
        width: 48,
        height: 48,
        borderRadius: 24,
        transform: [{ translateY: -4 }],
    },
    pinCount: {
        position: 'absolute',
        top: -5,
        right: -5,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.error,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    pinCountSelected: {
        backgroundColor: '#fff',
    },
    pinCountText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
    },
    pinPointer: {
        width: 0,
        height: 0,
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderTopWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: colors.primary,
        marginTop: -1,
    },
    pinPointerSelected: {
        borderTopColor: colors.primaryDark,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderTopWidth: 9,
    },

    // ── Bottom carousel ──
    carouselContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
    },
    cardOuter: {
        width: CARD_WIDTH,
        marginRight: CARD_SPACING,
        paddingVertical: 6,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
    },
    cardImage: {
        width: 100,
        height: 110,
    },
    discountBadge: {
        position: 'absolute',
        top: 14,
        left: 8,
        backgroundColor: colors.error,
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },
    discountText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#fff',
    },
    cardBody: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardStoreName: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text.primary,
        flex: 1,
        marginRight: 8,
    },
    ratingPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FFF8E1',
        paddingHorizontal: 7,
        paddingVertical: 3,
        borderRadius: 8,
    },
    ratingValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F57C00',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    cardAddress: {
        fontSize: 12,
        color: colors.text.tertiary,
        flex: 1,
    },
    statsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    statChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: colors.backgroundDark,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    urgentChip: {
        backgroundColor: colors.errorBackground,
    },
    statText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.text.secondary,
    },
    chevronContainer: {
        justifyContent: 'center',
        paddingRight: 8,
    },
});

export default MapScreen;
