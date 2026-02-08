import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, FlatList, TouchableOpacity, Image, PermissionsAndroid } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator';
import { useDiscovery } from '../../hooks/useDiscovery';

import { colors, spacing, typography } from '../../theme';
import Icon from '../../components/ui/Icon';
import { Product } from '../../domain/Product';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = spacing.md;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

const MapScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<DiscoveryStackParamList>>();
    const mapRef = useRef<MapView>(null);
    const flatListRef = useRef<FlatList>(null);
    // Default region (Tashkent, Uzbekistan) if permission denied or loading
    const [region, setRegion] = useState<Region>({
        latitude: 41.2995,
        longitude: 69.2401,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const { products, isLoading } = useDiscovery({
        lat: region.latitude,
        lng: region.longitude,
        radius: 10000 // 10km radius
    });

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    // Initial Location
    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    return;
                }

                let location = await Location.getCurrentPositionAsync({});
                setRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            } catch (e) {
                // Fallback to default
            }
        })();
    }, []);

    // Scroll to marker when product selected
    const handleMarkerPress = (product: Product, index: number) => {
        setSelectedProductId(product.id);
        flatListRef.current?.scrollToIndex({ index, animated: true });

        mapRef.current?.animateToRegion({
            latitude: product.store.location.lat,
            longitude: product.store.location.lng,
            latitudeDelta: 0.01, // Zoom in closer
            longitudeDelta: 0.01,
        });
    };

    // Scroll map when card scrolled
    const onMomentumScrollEnd = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
        if (products && products[index]) {
            const product = products[index];
            setSelectedProductId(product.id);
            mapRef.current?.animateToRegion({
                latitude: product.store.location.lat,
                longitude: product.store.location.lng,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
        }
    };

    const renderCarouselItem = ({ item }: { item: Product }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
            style={styles.cardContainer}
        >
            <View style={styles.card}>
                <Image source={{ uri: item.images[0]?.url }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.storeName} numberOfLines={1}>{item.store.name}</Text>
                        <View style={styles.ratingContainer}>
                            <Icon name="star-filled" size={14} color={colors.warning} />
                            <Text style={styles.ratingText}>{item.store.rating || '4.8'}</Text>
                        </View>
                    </View>

                    <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>

                    <View style={styles.cardFooter}>
                        <View style={styles.priceContainer}>
                            <Text style={styles.price}>${(item.discountedPrice / 100).toFixed(2)}</Text>
                            <Text style={styles.originalPrice}>${(item.originalPrice / 100).toFixed(2)}</Text>
                        </View>
                        <View style={styles.stockBadge}>
                            <Text style={styles.stockText}>{item.quantityAvailable} left</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                region={region}
                showsUserLocation
                showsMyLocationButton={false} // Custom button usually better
            >
                {products?.map((product, index) => (
                    <Marker
                        key={product.id}
                        coordinate={{
                            latitude: product.store.location.lat,
                            longitude: product.store.location.lng,
                        }}
                        onPress={() => handleMarkerPress(product, index)}
                    >
                        {/* Custom Marker View */}
                        <View style={[
                            styles.markerContainer,
                            selectedProductId === product.id && styles.selectedMarker
                        ]}>
                            <Image
                                source={{ uri: product.store.imageUrl || product.images[0]?.url }} // Fallback
                                style={styles.markerImage}
                            />
                            <View style={styles.markerPriceBadge}>
                                <Text style={styles.markerPriceText}>${(product.discountedPrice / 100).toFixed(0)}</Text>
                            </View>
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* Back Button / Overlay Controls if needed */}
            {/* Note: Since this is a tab, we generally don't need a back button, but maybe a list toggle */}

            {/* Bottom Carousel */}
            <View style={styles.carouselContainer}>
                <FlatList
                    ref={flatListRef}
                    data={products}
                    renderItem={renderCarouselItem}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled={false}
                    snapToInterval={SNAP_INTERVAL}
                    decelerationRate="fast"
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 }}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    carouselContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 90 : 70, // Adjust for tab bar
        left: 0,
        right: 0,
        height: 140, // Height of card + shadows
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: 120, // Content height
        marginRight: CARD_SPACING,
        paddingVertical: 5, // For shadow
    },
    card: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: spacing.sm,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    cardImage: {
        width: 100,
        height: '100%',
        borderRadius: 12,
        backgroundColor: colors.surface,
    },
    cardContent: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    storeName: {
        ...typography.caption,
        color: colors.text.secondary,
        fontWeight: '600',
        flex: 1,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        ...typography.caption,
        fontWeight: 'bold',
        color: colors.text.primary,
    },
    productName: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text.primary,
        marginBottom: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 6,
    },
    price: {
        ...typography.h4,
        color: colors.primary,
    },
    originalPrice: {
        ...typography.caption,
        color: colors.text.tertiary,
        textDecorationLine: 'line-through',
    },
    stockBadge: {
        backgroundColor: colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    stockText: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.text.secondary,
    },

    // Markers
    markerContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'white',
        borderColor: 'white',
        borderWidth: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    selectedMarker: {
        transform: [{ scale: 1.2 }],
        borderColor: colors.primary,
        zIndex: 10,
    },
    markerImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    markerPriceBadge: {
        position: 'absolute',
        bottom: -6,
        backgroundColor: colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    markerPriceText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default MapScreen;
