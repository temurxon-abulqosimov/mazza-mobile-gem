import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FavoriteStoreCardProps {
  store: any;
  onPress: () => void;
}

const FavoriteStoreCard = ({ store, onPress }: FavoriteStoreCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: store.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={13} color="#FFB800" />
          <Text style={styles.rating}>{Number(store.rating || 0).toFixed(1)}</Text>
          {store.distance != null && (
            <>
              <Text style={styles.separator}>·</Text>
              <Ionicons name="location-outline" size={13} color="#999" />
              <Text style={styles.distance}>{Number(store.distance).toFixed(1)} km</Text>
            </>
          )}
        </View>
        {store.address && (
          <Text style={styles.address} numberOfLines={1}>{store.address}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginLeft: 3,
  },
  separator: {
    fontSize: 13,
    color: '#ccc',
    marginHorizontal: 6,
  },
  distance: {
    fontSize: 13,
    color: '#888',
    marginLeft: 2,
  },
  address: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default FavoriteStoreCard;
