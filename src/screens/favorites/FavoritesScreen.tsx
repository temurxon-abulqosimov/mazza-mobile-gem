import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useFavorites } from '../../hooks/useFavorites';
import FavoriteProductCard from '../../components/favorites/FavoriteProductCard';
import FavoriteStoreCardSkeleton from '../../components/favorites/FavoriteStoreCardSkeleton';
import { favoriteApi } from '../../api';

const FavoritesScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const {
    favorites,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useFavorites({
    type: 'PRODUCT',
    lat: location?.coords.latitude,
    lng: location?.coords.longitude,
  });

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') return;
      try {
        const currentLocation = await Location.getLastKnownPositionAsync();
        if (currentLocation) {
          setLocation(currentLocation);
        } else {
          const freshLocation = await Location.getCurrentPositionAsync();
          setLocation(freshLocation);
        }
      } catch (e) {
        console.error('Could not get location for favorites', e);
      }
    })();
  }, []);

  const handleProductPress = (productId: string) => {
    navigation.navigate('Discover', {
      screen: 'ProductDetail',
      params: { productId },
    });
  };

  const handleReservePress = (productId: string) => {
    navigation.navigate('Discover', {
      screen: 'ProductDetail',
      params: { productId },
    });
  };

  const handleRemoveProduct = async (productId: string) => {
    try {
      await favoriteApi.removeFavoriteProduct(productId);
      refetch();
    } catch (e) {
      console.error('Failed to remove favorite product', e);
      Alert.alert('Error', 'Could not remove product from favorites.');
    }
  };

  const handleStartExploring = () => {
    navigation.navigate('Discover');
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <Ionicons
            name='heart-outline'
            size={56}
            color="#ff7a33"
          />
        </View>
        <Text style={styles.emptyTitle}>
          No favorite products yet
        </Text>
        <Text style={styles.emptySubtitle}>
          Tap the heart icon on a product to save it here for easy access.
        </Text>
        <TouchableOpacity style={styles.exploreButton} onPress={handleStartExploring}>
          <Text style={styles.exploreButtonText}>Start Exploring</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <FavoriteProductCard
        product={item}
        onPress={() => handleProductPress(item.id)}
        onRemove={() => handleRemoveProduct(item.id)}
        onReserve={() => handleReservePress(item.id)}
      />
    );
  };

  const LoadingSkeleton = () => (
    <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
      <FavoriteStoreCardSkeleton />
      <FavoriteStoreCardSkeleton />
      <FavoriteStoreCardSkeleton />
      <FavoriteStoreCardSkeleton />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      {isLoading && favorites.length === 0 ? (
        <LoadingSkeleton />
      ) : isError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color="#ccc" />
          <Text style={styles.errorText}>Could not load your favorites.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites.filter((item) => item && item.id)}
          renderItem={renderItem}
          keyExtractor={(item, index) => item?.id || `favorite-${index}`}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ margin: 20 }} color="#ff7a33" />
            ) : null
          }
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          onRefresh={refetch}
          refreshing={isRefetching}
          contentContainerStyle={[
            styles.listContent,
            favorites.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerRight: {
    width: 36,
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#ff7a33',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#999',
  },
  activeTabText: {
    color: '#1a1a1a',
  },
  // List
  listContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF3EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  exploreButton: {
    backgroundColor: '#ff7a33',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    color: '#666',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ff7a33',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FavoritesScreen;
