import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useDiscovery } from '../../hooks/useDiscovery';
import { useCategories } from '../../hooks/useCategories';
import { useLocation } from '../../hooks/useLocation';
import { favoriteApi } from '../../api';
import ProductCard from '../../components/discovery/ProductCard';
import { DiscoveryStackParamList } from '../../navigation/types';
import { LocationSelector } from '../../components/discovery/LocationSelector';
import { CategoryFilter, Category } from '../../components/discovery/CategoryFilter';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { ProductCardSkeleton } from '../../components/discovery/ProductCardSkeleton';
import { SellerCard } from '../../components/discovery/SellerCard';
import { SellerCardSkeleton } from '../../components/discovery/SellerCardSkeleton';
import { colors, spacing, typography } from '../../theme';
import Icon from '../../components/ui/Icon';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { useTranslation } from 'react-i18next';

type DiscoveryScreenNavigationProp = NativeStackNavigationProp<DiscoveryStackParamList>;

// Assets
const MOCK_BANNER = 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All', icon: 'grid' },
  { id: 'market', label: 'Market', icon: 'cart' },
  { id: 'bakery', label: 'Bakery', icon: 'bread' },
  { id: 'restaurant', label: 'Restaurant', icon: 'utensils' },
  { id: 'cafe', label: 'Café', icon: 'coffee' },
];

import { DEFAULT_LOCATION, DEFAULT_LOCATION_NAME } from '../../constants/location';

// ... (imports)

const DiscoveryScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<DiscoveryScreenNavigationProp>();

  // Custom Location Hook
  const {
    location: deviceLocation,
    isLoading: isLocationLoading,
    error: locationError,
    getLocation,
    requestPermissions,
    permissionStatus
  } = useLocation();

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use effective location for discovery
  const effectiveLocation = location || (isLocationLoading ? null : DEFAULT_LOCATION);

  // Discovery Hook
  const {
    products,
    isLoading: isDiscoveryLoading,
    refetch: refetchDiscovery,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useDiscovery({
    lat: effectiveLocation?.coords.latitude || 0,
    lng: effectiveLocation?.coords.longitude || 0,
    radius: 50, // 50 km radius
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    enabled: !!effectiveLocation,
  });

  // Initial Location Check
  useEffect(() => {
    const initLocation = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        getLocation();
      }
    };
    initLocation();
  }, [getLocation]);

  // Sync location state
  useEffect(() => {
    if (deviceLocation) {
      setLocation(deviceLocation);
      setUsingFallback(false);
    } else if (!isLocationLoading && !location) {
      // Only falls back if no location and not loading
      // We handle this via effectiveLocation for the hook, 
      // but for state we want to be explicit if permission is denied
      if (permissionStatus === Location.PermissionStatus.DENIED || locationError) {
        setLocation(DEFAULT_LOCATION as any);
        setUsingFallback(true);
      }
    }
  }, [deviceLocation, isLocationLoading, permissionStatus, locationError, location]);


  const handleRefresh = async () => {
    if (deviceLocation) {
      refetchDiscovery();
    } else {
      getLocation();
    }
  };

  const handleProductPress = (productId: string) => {
    // @ts-ignore - ProductDetail expects productId
    navigation.navigate('ProductDetail', { productId });
  };

  const handleStorePress = (store: any) => {
    // @ts-ignore - StoreProfile params
    navigation.navigate('StoreProfile', {
      storeId: store.id,
      storeName: store.name,
      storeImage: store.imageUrl,
      storeAddress: store.location?.address || 'Unknown Address',
      storeRating: store.rating,
    });
  };

  const handleRequestLocation = async () => {
    Alert.alert(
      t('discovery.location_permission'),
      t('discovery.location_permission_msg'),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.ok'),
          onPress: async () => {
            const granted = await requestPermissions();
            if (granted) {
              getLocation();
            } else {
              Alert.alert(t('discovery.permission_denied'), t('discovery.permission_denied_msg'));
            }
          }
        }
      ]
    );
  };

  const handleLocationPress = () => {
    getLocation();
  };

  const handleToggleFavorite = async (product: any) => {
    try {
      if (product.isFavorited) {
        await favoriteApi.removeFavoriteProduct(product.id);
      } else {
        await favoriteApi.addFavoriteProduct(product.id);
      }
      refetchDiscovery();
    } catch (e) {
      console.error('Failed to toggle favorite', e);
      Alert.alert(t('common.error'), t('discovery.could_not_update_favorites'));
    }
  };

  // Get unique sellers directly from useDiscovery hook if it returns them, 
  // otherwise extract from products
  const uniqueSellers = useMemo(() => {
    if (!products) return [];
    const uniqueStores = new Map();
    products.forEach((product) => {
      if (!product.store) return;

      const existingStore = uniqueStores.get(product.store.id);
      if (!existingStore) {
        uniqueStores.set(product.store.id, {
          id: product.store.id,
          name: product.store.name,
          imageUrl: product.store.imageUrl,
          category: 'Store', // Ideally should come from store categories
          rating: product.store.rating || 0,
          distance: product.distance || 0,
          address: product.store.location?.address || 'Unknown Address',
          location: product.store.location,
          products: [product], // Initialize with this product
        });
      } else {
        // Add product to existing store if not already present (optimization: check ID)
        if (!existingStore.products.find((p: any) => p.id === product.id)) {
          existingStore.products.push(product);
        }
      }
    });
    return Array.from(uniqueStores.values()).slice(0, 5);
  }, [products]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Location Selector */}
      <LocationSelector
        location={
          usingFallback
            ? `${DEFAULT_LOCATION_NAME} (Demo)`
            : (location ? t('discovery.current_location') : t('discovery.set_location'))
        }
        onPress={location ? handleLocationPress : handleRequestLocation}
      />

      {/* Notification Icon */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => {/* TODO: Navigate to notifications */ }}
      >
        <Icon name="notification" size={24} color={colors.text.primary} />
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>2</Text>
        </View>
      </TouchableOpacity>

      {/* Search Bar */}
      <SearchBar
        placeholder={t('discovery.search_placeholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        showVoice={false}
        style={styles.searchBar}
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    </View>
  );

  const renderNearbySellers = () => {
    if (isDiscoveryLoading && !isRefetching) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('discovery.nearby_sellers')}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {[1, 2, 3].map((key) => (
              <SellerCardSkeleton key={key} />
            ))}
          </ScrollView>
        </View>
      );
    }

    if (uniqueSellers.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('discovery.nearby_sellers')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SellerList')}>
            <Text style={styles.seeAllLink}>{t('discovery.see_all')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {uniqueSellers.map((seller: any) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              onPress={() => handleStorePress(seller)}
              onProductPress={handleProductPress}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAvailableNowHeader = () => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('discovery.available_now')}</Text>
        <View style={styles.offersIndicator}>
          <View style={styles.offersIndicatorDot} />
          <Text style={styles.offersIndicatorText}>{`${products ? products.length : 0} ${t('discovery.offers')}`}</Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    // 1. Initial State (No Location)
    if (!effectiveLocation && !isLocationLoading) {
      return (
        <View style={styles.container}>
          {renderHeader()}
          <EmptyState
            icon="location"
            title={t('discovery.location_required')}
            subtitle={t('discovery.location_required_msg')}
            action={{
              label: t('discovery.enable_location'),
              onPress: handleRequestLocation
            }}
          />
        </View>
      );
    }

    // 2. Loading State (Location found but query loading)
    if ((isDiscoveryLoading || isLocationLoading) && (!products || products.length === 0)) {
      return (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          {/* Banner Skeleton */}
          <View style={[styles.bannerContainer, { backgroundColor: '#f0f0f0' }]} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t('discovery.nearby_sellers')}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {[1, 2, 3].map((key) => <SellerCardSkeleton key={key} />)}
            </ScrollView>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('discovery.available_now')}</Text>
            {[1, 2, 3].map((key) => <ProductCardSkeleton key={key} />)}
          </View>
        </View>
      );
    }

    // 3. Error State
    // if (isError) { ... } -> handled by empty state on list empty component if desired, or explicitly here

    // 4. Data Content
    return (
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => handleProductPress(item.id)}
            onToggleFavorite={() => handleToggleFavorite(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={colors.primary} style={{ padding: 16 }} /> : null}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}

            {/* Banner */}
            <View style={styles.bannerContainer}>
              <Image source={{ uri: MOCK_BANNER }} style={styles.bannerImage} />
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>Fresh Halal Meat</Text>
                <Text style={styles.bannerSubtitle}>Up to 20% off this week</Text>
              </View>
            </View>

            {renderNearbySellers()}

            <View style={styles.section}>
              {renderAvailableNowHeader()}
            </View>
          </>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="search"
            title={t('discovery.no_products')}
            subtitle={t('discovery.no_products_subtitle')}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <SafeAreaWrapper>
      <StatusBar barStyle="dark-content" />
      {renderContent()}
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.card,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    position: 'relative',
  },
  notificationButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.lg,
    padding: spacing.sm,
    zIndex: 10,
  },
  notificationBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchBar: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  section: {
    marginTop: spacing.sectionMargin,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  seeAllLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  offersIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offersIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.xs,
  },
  offersIndicatorText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  bannerContainer: {
    height: 180,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bannerTitle: {
    ...typography.h3,
    color: 'white',
    marginBottom: 4,
  },
  bannerSubtitle: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
});

export default DiscoveryScreen;
