import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  ActivityIndicator,
  Animated,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDiscovery } from '../../hooks/useDiscovery';
import { useCategories } from '../../hooks/useCategories';
import { useLocation } from '../../hooks/useLocation';
import { useSearch } from '../../hooks/useSearch';
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

// Animated wrapper for product cards — fade in + slide up on mount
const AnimatedProductItem = React.memo(({ children, index }: { children: React.ReactNode; index: number }) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 350,
      delay: Math.min(index * 60, 300),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{
        opacity: animValue,
        transform: [{
          translateY: animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [24, 0],
          }),
        }],
      }}
    >
      {children}
    </Animated.View>
  );
});

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

  // Use effective location for discovery — ALWAYS fall back to DEFAULT_LOCATION
  // Never return null (prevents query from being disabled during GPS loading on Android)
  const effectiveLocation = location || DEFAULT_LOCATION;

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
    lat: effectiveLocation.coords.latitude,
    lng: effectiveLocation.coords.longitude,
    radius: 50, // 50 km radius
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    enabled: true,
  });

  // Search Hook
  const {
    products: searchProducts,
    stores: searchStores,
    isSearchActive,
    isSearching,
  } = useSearch(searchQuery, {
    lat: effectiveLocation.coords.latitude,
    lng: effectiveLocation.coords.longitude,
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

  const handleClearSearch = () => {
    setSearchQuery('');
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

  // ── Sticky Header: rendered OUTSIDE FlatList so it never unmounts ──
  const renderStickyHeader = () => (
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

      {/* Search Bar — lives outside FlatList to keep focus */}
      <SearchBar
        placeholder={t('discovery.search_placeholder')}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={() => Keyboard.dismiss()}
        onClear={handleClearSearch}
        style={styles.searchBar}
      />

      {/* Category Filter — hide during search */}
      {!isSearchActive && (
        <CategoryFilter
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}
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

  // Memoized search list header — no arrow fn in ListHeaderComponent
  const SearchListHeader = useMemo(() => (
    <>
      {/* Searching indicator */}
      {isSearching && (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.searchingText}>{t('discovery.searching')}</Text>
        </View>
      )}

      {/* Store search results */}
      {searchStores.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('discovery.stores')}</Text>
            <Text style={styles.searchResultCount}>
              {searchStores.length} {t('discovery.found')}
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            keyboardShouldPersistTaps="handled"
          >
            {searchStores.map((store: any) => (
              <SellerCard
                key={store.id}
                seller={store}
                onPress={() => handleStorePress(store)}
                onProductPress={handleProductPress}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Products header */}
      {searchProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('discovery.products')}</Text>
            <Text style={styles.searchResultCount}>
              {searchProducts.length} {t('discovery.found')}
            </Text>
          </View>
        </View>
      )}
    </>
  ), [isSearching, searchStores, searchProducts, t]);

  const SearchEmptyComponent = useMemo(() => (
    !isSearching ? (
      <EmptyState
        icon="search"
        title={t('discovery.no_search_results')}
        subtitle={t('discovery.no_search_results_subtitle', { query: searchQuery })}
      />
    ) : null
  ), [isSearching, searchQuery, t]);

  const renderSearchResults = () => {
    return (
      <FlatList
        data={searchProducts}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item, index }) => (
          <AnimatedProductItem index={index}>
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item)}
            />
          </AnimatedProductItem>
        )}
        ListHeaderComponent={SearchListHeader}
        ListEmptyComponent={SearchEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  const renderContent = () => {
    // Search mode — show search results instead of discovery feed
    if (isSearchActive) {
      return renderSearchResults();
    }

    // 1. Loading State
    if (isDiscoveryLoading && (!products || products.length === 0)) {
      return (
        <View style={styles.loadingContainer}>
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
    // Stable header element — no inline arrow function
    const DiscoveryListHeader = (
      <>
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
    );

    return (
      <FlatList
        data={products}
        renderItem={({ item, index }) => (
          <AnimatedProductItem index={index}>
            <ProductCard
              product={item}
              onPress={() => handleProductPress(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item)}
            />
          </AnimatedProductItem>
        )}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={Platform.OS === 'android'}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator size="small" color={colors.primary} style={{ padding: 16 }} /> : null}
        ListHeaderComponent={DiscoveryListHeader}
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
      {renderStickyHeader()}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    flex: 1,
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
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  searchingText: {
    marginLeft: spacing.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  searchResultCount: {
    fontSize: 14,
    color: colors.text.tertiary,
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
