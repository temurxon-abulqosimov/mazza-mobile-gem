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
import { config, isGoogleMapsConfigured } from '../../config/environment';

type MapScreenNavigationProp = NativeStackNavigationProp<any>;

const MapScreen = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
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

        // Set initial region centered on user's location
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.05, // ~5km zoom
          longitudeDelta: 0.05,
        });
      } catch (error) {
        setLocationError('Could not fetch location.');
        console.error('Location error:', error);
        // Set default location (San Francisco as fallback)
        const defaultRegion = {
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
        setRegion(defaultRegion);
        Alert.alert(
          'Location Error',
          'Could not get your current location. Showing default area.'
        );
      }
    })();
  }, []);

  // Fetch nearby products/stores based on location
  const { products, isLoading } = useDiscovery({
    lat: location?.coords.latitude ?? 0,
    lng: location?.coords.longitude ?? 0,
    radius: 5000, // 5km radius
    enabled: !!location,
  });

  // Extract unique stores from products
  const stores: Store[] = React.useMemo(() => {
    const storeMap = new Map<string, Store>();
    products.forEach((product: Product) => {
      if (!storeMap.has(product.store.id)) {
        storeMap.set(product.store.id, product.store);
      }
    });
    return Array.from(storeMap.values());
  }, [products]);

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

  if (isLoading || !region) {
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
        {isMapReady && stores.map((store) => (
          <Marker
            key={store.id}
            coordinate={{
              latitude: store.location.lat,
              longitude: store.location.lng,
            }}
            onPress={() => handleMarkerPress(store)}
            tracksViewChanges={false}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.marker,
                selectedStore?.id === store.id && styles.markerSelected
              ]}>
                <Text style={styles.markerText}>🏪</Text>
              </View>
              {store.distance !== undefined && (
                <View style={styles.markerBadge}>
                  <Text style={styles.markerBadgeText}>
                    {store.distance.toFixed(1)}km
                  </Text>
                </View>
              )}
            </View>

            {/* Callout on Android */}
            {Platform.OS === 'android' && (
              <Callout onPress={() => handleMarkerPress(store)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{store.name}</Text>
                  <Text style={styles.calloutSubtitle}>
                    {store.distance !== undefined ? `${store.distance.toFixed(1)}km away` : 'Nearby'}
                  </Text>
                </View>
              </Callout>
            )}
          </Marker>
        ))}
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
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
    ...shadows.md,
  },
  markerSelected: {
    backgroundColor: colors.success,
    borderColor: colors.primary,
    borderWidth: 4,
    transform: [{ scale: 1.2 }],
  },
  markerText: {
    fontSize: 22,
  },
  markerBadge: {
    marginTop: 2,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: spacing.radiusSm,
    borderWidth: 1,
    borderColor: colors.divider,
    ...shadows.sm,
  },
  markerBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.primary,
  },
  callout: {
    padding: spacing.sm,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
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
