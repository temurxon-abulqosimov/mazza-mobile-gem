import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDiscovery } from '../../hooks/useDiscovery';
import { StoreBottomSheet } from '../../components/map/StoreBottomSheet';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { Store } from '../../domain/Store';
import { Product } from '../../domain/Product';
import { colors, spacing, shadows } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { config, isGoogleMapsConfigured } from '../../config/environment';

type MapScreenNavigationProp = NativeStackNavigationProp<any>;

const MapScreen = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 41.2995,
    longitude: 69.2401,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [isMapReady, setIsMapReady] = useState(false);

  // Request location permissions and get current location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        Alert.alert(
          'Location Permission',
          'Please enable location services to see nearby stores on the map.'
        );
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);

        // Set region centered on user's location
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      } catch (error) {
        setLocationError('Could not fetch location.');
        console.error('Location error:', error);
        // Region already initialized with Tashkent defaults
        Alert.alert(
          'Location Error',
          'Could not get your current location. Showing default area.'
        );
      }
    })();
  }, []);

  // Fetch nearby products/stores — region is always set (Tashkent default or GPS)
  const { products, isLoading } = useDiscovery({
    lat: region.latitude,
    lng: region.longitude,
    radius: 50,
    enabled: true,
  });

  // Group products by store — includes cheapest price for marker labels
  interface StoreGroup {
    store: Store;
    products: Product[];
    cheapestPrice: number;
  }
  const storeGroups: StoreGroup[] = React.useMemo(() => {
    const map = new Map<string, StoreGroup>();
    products.forEach((product: Product) => {
      const sid = product.store.id;
      if (!map.has(sid)) {
        map.set(sid, {
          store: product.store,
          products: [product],
          cheapestPrice: product.discountedPrice,
        });
      } else {
        const g = map.get(sid)!;
        g.products.push(product);
        if (product.discountedPrice < g.cheapestPrice) g.cheapestPrice = product.discountedPrice;
      }
    });
    return Array.from(map.values());
  }, [products]);

  // For backward compat with bottom sheet
  const stores = storeGroups.map(g => g.store);

  const handleMarkerPress = (store: Store) => {
    setSelectedStore(store);

    // Animate to marker location
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: store.location.lat,
          longitude: store.location.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        500
      );
    }
  };

  const handleCloseBottomSheet = () => {
    setSelectedStore(null);
  };

  const handleViewStore = (storeId: string) => {
    setSelectedStore(null);
    // Navigate to discovery screen filtered by this store
    // For now, we'll just navigate to the main discovery feed
    navigation.navigate('Discover');
  };

  const handleRecenterMap = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500
      );
    }
  };

  const handleMapReady = () => {
    setIsMapReady(true);
  };

  if (isLoading && stores.length === 0) {
    return <LoadingScreen message="Loading map..." />;
  }

  // Show warning if Google Maps is not configured
  if (!isGoogleMapsConfigured() && __DEV__) {
    console.warn(
      '⚠️ Google Maps API key not configured. Please add your API keys to .env file.\n' +
      'Android: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID\n' +
      'iOS: EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS\n' +
      'Get keys from: https://console.cloud.google.com/'
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
        onMapReady={handleMapReady}
        loadingEnabled
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor={colors.background}
      >
        {/* Store Markers */}
        {isMapReady && storeGroups.map((group) => {
          const isSelected = selectedStore?.id === group.store.id;
          const price = `$${(group.cheapestPrice / 100).toFixed(0)}`;
          return (
            <Marker
              key={group.store.id}
              coordinate={{
                latitude: group.store.location.lat,
                longitude: group.store.location.lng,
              }}
              onPress={() => handleMarkerPress(group.store)}
              tracksViewChanges={isSelected}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.markerWrapper}>
                <View style={[styles.markerBubble, isSelected && styles.markerBubbleSelected]}>
                  <View style={[styles.markerIcon, isSelected && styles.markerIconSelected]}>
                    <Ionicons name="storefront" size={14} color={isSelected ? '#fff' : colors.primary} />
                  </View>
                  <View style={styles.markerInfo}>
                    <Text style={[styles.markerName, isSelected && styles.markerNameSelected]} numberOfLines={1}>
                      {group.store.name}
                    </Text>
                    <View style={styles.markerMeta}>
                      <Text style={[styles.markerPrice, isSelected && styles.markerPriceSelected]}>
                        From {price}
                      </Text>
                      <View style={[styles.markerDot, isSelected && styles.markerDotSelected]} />
                      <Text style={[styles.markerCount, isSelected && styles.markerCountSelected]}>
                        {group.products.length} {group.products.length === 1 ? 'item' : 'items'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.markerArrow, isSelected && styles.markerArrowSelected]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Recenter Button */}
      {location && (
        <TouchableOpacity
          style={styles.recenterButton}
          onPress={handleRecenterMap}
        >
          <Text style={styles.recenterIcon}>📍</Text>
        </TouchableOpacity>
      )}

      {/* Store Count Badge */}
      <View style={styles.storeCountBadge}>
        <Text style={styles.storeCountIcon}>🏪</Text>
        <Text style={styles.storeCountText}>
          {stores.length} {stores.length === 1 ? 'store' : 'stores'} nearby
        </Text>
      </View>

      {/* API Key Warning (Development Only) */}
      {!isGoogleMapsConfigured() && __DEV__ && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningText}>
            ⚠️ Google Maps API key not configured
          </Text>
        </View>
      )}

      {/* Bottom Sheet */}
      {selectedStore && (
        <StoreBottomSheet
          store={selectedStore}
          onClose={handleCloseBottomSheet}
          onViewStore={handleViewStore}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerWrapper: {
    alignItems: 'center',
  },
  markerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.06)',
    maxWidth: 180,
  },
  markerBubbleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.success,
    shadowOpacity: 0.3,
    elevation: 12,
  },
  markerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(76,175,80,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  markerIconSelected: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  markerInfo: {
    flex: 1,
  },
  markerName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  markerNameSelected: {
    color: '#fff',
  },
  markerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  markerPriceSelected: {
    color: '#E8F5E9',
  },
  markerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.text.tertiary,
    marginHorizontal: 5,
  },
  markerDotSelected: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  markerCount: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  markerCountSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
  },
  markerArrowSelected: {
    borderTopColor: colors.primary,
  },
  recenterButton: {
    position: 'absolute',
    bottom: spacing.xxl + 180, // Above bottom sheet
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  recenterIcon: {
    fontSize: 24,
  },
  storeCountBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? spacing.xxxl + 40 : spacing.xxl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.radiusXl,
    ...shadows.md,
  },
  storeCountIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  storeCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  warningBanner: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: '#FFA500',
    padding: spacing.md,
    borderRadius: spacing.radiusMd,
    ...shadows.md,
  },
  warningText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.inverse,
    textAlign: 'center',
  },
});

export default MapScreen;
