import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useFavorites } from '../../hooks/useFavorites';
import FavoriteStoreCard from '../../components/favorites/FavoriteStoreCard';
import FavoritesHeader from '../../components/navigation/FavoritesHeader';
import FavoriteStoreCardSkeleton from '../../components/favorites/FavoriteStoreCardSkeleton';

const LoadingComponent = () => (
    <View style={{ paddingHorizontal: 16 }}>
        <FavoriteStoreCardSkeleton />
        <FavoriteStoreCardSkeleton />
        <FavoriteStoreCardSkeleton />
        <FavoriteStoreCardSkeleton />
    </View>
);

const FavoritesScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [activeTab, setActiveTab] = useState<'Stores' | 'Products'>('Stores');
  
  const { 
    favorites, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    refetch 
  } = useFavorites({
    lat: location?.coords.latitude,
    lng: location?.coords.longitude,
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission not granted for favorites distance calculation.');
        return;
      }
      try {
        let currentLocation = await Location.getLastKnownPositionAsync();
        if (currentLocation) {
            setLocation(currentLocation);
        } else {
            let freshLocation = await Location.getCurrentPositionAsync();
            setLocation(freshLocation);
        }
      } catch (e) {
        console.error("Could not get location for favorites", e);
      }
    })();
  }, []);

  const ListEmptyComponent = () => (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>No favorite stores yet</Text>
      <Text style={styles.emptySubText}>Tap the heart icon on a store to save it here.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FavoritesHeader />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
            style={[styles.tab, activeTab === 'Stores' && styles.activeTab]} 
            onPress={() => setActiveTab('Stores')}
        >
          <Text style={[styles.tabText, activeTab === 'Stores' && styles.activeTabText]}>Stores</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.tab, styles.disabledTab]} 
            disabled={true}
        >
          <Text style={[styles.tabText, styles.disabledTabText]}>Products</Text>
        </TouchableOpacity>
      </View>

      {isLoading && favorites.length === 0 ? (
        <LoadingComponent />
      ) : isError ? (
        <View style={styles.centered}>
            <Text style={styles.errorText}>Could not load your favorites.</Text>
            <Button title="Try Again" onPress={() => refetch()} color="#FF7A00"/>
        </View>
      ) : (
        <FlatList
            data={favorites.filter(item => item && item.id)}
            renderItem={({ item }) => (
            <FavoriteStoreCard store={item} onPress={() => { /* TODO: Navigate to store detail */ }} />
            )}
            keyExtractor={(item, index) => item?.id || `favorite-${index}`}
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ margin: 20 }} color="#FF7A00" /> : null}
            onEndReached={() => {
                if (hasNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            onRefresh={refetch}
            refreshing={isLoading && favorites.length > 0}
            contentContainerStyle={styles.listContent}
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
    },
    emptySubText: {
      fontSize: 14,
      color: '#888',
      textAlign: 'center',
      marginTop: 8,
    },
    errorText: {
      fontSize: 16,
      color: '#D32F2F',
      marginBottom: 10,
    },
    listContent: {
      paddingBottom: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 10,
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 10,
        backgroundColor: '#F3F3F3',
        borderRadius: 25,
        justifyContent: 'center',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    disabledTab: {
        opacity: 0.5,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 16,
        color: '#888',
    },
    activeTabText: {
        color: '#FF7A00',
    },
    disabledTabText: {
        color: '#888',
    }
});

export default FavoritesScreen;