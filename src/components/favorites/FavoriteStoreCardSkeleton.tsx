import React from 'react';
import { View, StyleSheet } from 'react-native';

const FavoriteStoreCardSkeleton = () => {
  return (
    <View style={styles.container}>
      <View style={styles.image} />
      <View style={styles.info}>
        <View style={styles.titleLine} />
        <View style={styles.metaLine} />
        <View style={styles.priceLine} />
      </View>
      <View style={styles.button} />
    </View>
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
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  info: {
    flex: 1,
    marginLeft: 14,
    height: 90,
    justifyContent: 'center',
  },
  titleLine: {
    width: '75%',
    height: 16,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
    marginBottom: 10,
  },
  metaLine: {
    width: '50%',
    height: 12,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
    marginBottom: 14,
  },
  priceLine: {
    width: '30%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#F0F0F0',
  },
  button: {
    width: 72,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F0F0',
  },
});

export default FavoriteStoreCardSkeleton;
