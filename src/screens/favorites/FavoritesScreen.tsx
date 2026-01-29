import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button } from 'react-native';
import * as Location from 'expo-location';
import { useFavorites } from '../../hooks/useFavorites';
import FavoriteStoreCard from '../../components/favorites/FavoriteStoreCard';

const FavoritesScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
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
        // If permissions were not already granted, we might not need to ask again,
        // as the discovery screen would have handled it. We can just fail gracefully.
        console.log('Location permission not granted for favorites distance calculation.');
        return;
      }
      try {
        let currentLocation = await Location.getLastKnownPositionAsync();
        setLocation(currentLocation);
      } catch (e) {
        console.error("Could not get last known location", e);
      }
    })();
  }, []);

  if (isLoading) {
    return <View style={styles.centered}><ActivityIndicator size="large" /></View>;
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text>Could not load your favorites.</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Favorites</Text>
      </View>
      <FlatList
        data={favorites}
        renderItem={({ item }) => (
          <FavoriteStoreCard store={item} onPress={() => { /* TODO: Navigate to store detail */ }} />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<View style={styles.centered}><Text>You haven't favorited any stores yet.</Text></View>}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ margin: 20 }} /> : null}
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        onRefresh={refetch}
        refreshing={isLoading}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5ff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: 'white',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
});

export default FavoritesScreen;