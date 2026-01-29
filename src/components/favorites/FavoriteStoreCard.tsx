import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { FavoriteStore } from '../../domain/Favorite';

interface FavoriteStoreCardProps {
  store: FavoriteStore;
  onPress: () => void;
}

const FavoriteStoreCard = ({ store, onPress }: FavoriteStoreCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Image source={{ uri: store.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{store.name}</Text>
        <Text style={styles.rating}>⭐ {store.rating.toFixed(1)}</Text>
        {store.distance && <Text style={styles.distance}>{store.distance.toFixed(1)} km away</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  distance: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  }
});

export default FavoriteStoreCard;
