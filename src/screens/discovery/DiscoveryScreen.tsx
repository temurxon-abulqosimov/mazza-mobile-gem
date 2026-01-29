import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Button, FlatList, Alert } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useDiscovery } from '../../hooks/useDiscovery';
import ProductCard from '../../components/discovery/ProductCard';
import { DiscoveryStackParamList } from '../../navigation/DiscoveryNavigator';

type DiscoveryScreenNavigationProp = NativeStackNavigationProp<DiscoveryStackParamList, 'DiscoveryFeed'>;

const DiscoveryScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const navigation = useNavigation<DiscoveryScreenNavigationProp>();

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        Alert.alert('Permission Denied', 'Please enable location services to find deals near you.');
        return;
      }

      try {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } catch (error) {
        setLocationError('Could not fetch location.');
        Alert.alert('Location Error', 'Could not fetch your current location. Please ensure GPS is enabled.');
      }
    })();
  }, []);

  const { products, isLoading, isError, refetch } = useDiscovery({
    lat: location?.coords.latitude,
    lng: location?.coords.longitude,
    enabled: !!location,
  });

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const renderContent = () => {
    if (!location && !locationError) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text>Getting your location...</Text>
        </View>
      );
    }
    
    if (locationError) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
          <Text>Finding great deals near you...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Could not fetch products. Please try again.</Text>
          <Button title="Retry" onPress={() => refetch()} />
        </View>
      );
    }

    if (products.length === 0) {
        return (
            <View style={styles.centered}>
                <Text>No products found near you.</Text>
                <Button title="Refresh" onPress={() => refetch()} />
            </View>
        )
    }

    return (
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => handleProductPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isLoading}
        style={styles.list}
      />
    );
  };

  return <View style={styles.container}>{renderContent()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
      flex: 1,
  }
});

export default DiscoveryScreen;
