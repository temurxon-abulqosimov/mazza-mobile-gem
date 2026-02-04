import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useDiscovery } from '../../hooks/useDiscovery';
import ProductCard from '../../components/discovery/ProductCard';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator';
import { LocationSelector } from '../../components/discovery/LocationSelector';
import { CategoryFilter, Category } from '../../components/discovery/CategoryFilter';
import { SearchBar } from '../../components/ui/SearchBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { ProductCardSkeleton } from '../../components/discovery/ProductCardSkeleton';
import { SellerCard } from '../../components/discovery/SellerCard';
import { SellerCardSkeleton } from '../../components/discovery/SellerCardSkeleton';
import { colors, spacing, typography } from '../../theme';

type DiscoveryScreenNavigationProp = NativeStackNavigationProp<DiscoveryStackParamList, 'DiscoveryFeed'>;

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All', icon: '🍽️' },
  { id: 'market', label: 'Market', icon: '🛒' },
  { id: 'bakery', label: 'Bakery', icon: '🥖' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'cafe', label: 'Café', icon: '☕' },
];

const DiscoveryScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<DiscoveryScreenNavigationProp>();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        setLocationError('Could not fetch location.');
      }
    })();
  }, []);

  const { products, isLoading, isError, refetch } = useDiscovery({
    lat: location?.coords.latitude ?? 37.7858, // Default to San Francisco (where test store is)
    lng: location?.coords.longitude ?? -122.4064,
    enabled: true,
  });

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const handleLocationPress = () => {
    // TODO: Implement location picker
    console.log('Location picker pressed');
  };

  // Get unique sellers from products (deduplicate by store ID)
  const mockSellers = useMemo(() => {
    const uniqueStores = new Map();
    products.forEach((product) => {
      if (!uniqueStores.has(product.store.id)) {
        uniqueStores.set(product.store.id, {
          id: product.store.id,
          name: product.store.name,
          imageUrl: product.store.imageUrl || product.images[0]?.thumbnailUrl || product.images[0]?.url,
          category: product.category?.name || 'Market',
          rating: product.store.rating || 4.5,
          distance: product.distance || 0,
        });
      }
    });
    return Array.from(uniqueStores.values()).slice(0, 5);
  }, [products]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Location Selector */}
      <LocationSelector
        location="San Francisco"
        onPress={handleLocationPress}
      />

      {/* Notification Icon */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => {/* TODO: Navigate to notifications from discovery */}}
      >
        <Text style={styles.notificationIcon}>🔔</Text>
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>2</Text>
        </View>
      </TouchableOpacity>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search for food..."
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
    if (isLoading) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Sellers</Text>
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

    if (mockSellers.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Sellers</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllLink}>See all ›</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {mockSellers.map((seller) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              onPress={() => console.log('Seller pressed:', seller.id)}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAvailableNow = () => {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Now</Text>
          <View style={styles.offersIndicator}>
            <View style={styles.offersIndicatorDot} />
            <Text style={styles.offersIndicatorText}>{products.length} offers</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    // Initial loading state
    if (isLoading && products.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          {renderHeader()}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Sellers</Text>
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Now</Text>
            {[1, 2, 3].map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </View>
        </View>
      );
    }

    // Error state
    if (isError) {
      return (
        <View style={styles.container}>
          {renderHeader()}
          <EmptyState
            icon="🍱"
            title="No products available yet"
            subtitle="Check back soon for amazing deals on surplus food!"
            action={{
              label: 'Retry',
              onPress: () => refetch(),
            }}
          />
        </View>
      );
    }

    // Empty state
    if (products.length === 0) {
      return (
        <View style={styles.container}>
          {renderHeader()}
          <EmptyState
            icon="🔍"
            title="No products found"
            subtitle="Try adjusting your filters or check back later"
          />
        </View>
      );
    }

    // Main content with data
    return (
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => handleProductPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isLoading}
        ListHeaderComponent={() => (
          <>
            {renderHeader()}
            {renderNearbySellers()}
            {renderAvailableNow()}
          </>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
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
  },
  header: {
    backgroundColor: colors.card,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
  notificationIcon: {
    fontSize: 20,
  },
  notificationBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusFull,
    minWidth: 18,
    height: 18,
    paddingHorizontal: spacing.xxs,
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});

export default DiscoveryScreen;
