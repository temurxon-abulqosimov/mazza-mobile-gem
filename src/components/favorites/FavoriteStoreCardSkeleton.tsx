import React from 'react';
import { View, StyleSheet } from 'react-native';

const FavoriteStoreCardSkeleton = () => {
    return (
        <View style={styles.container}>
            <View style={styles.image} />
            <View style={styles.infoContainer}>
                <View style={styles.textLineLg} />
                <View style={styles.textLineSm} />
                <View style={styles.tag} />
            </View>
            <View style={styles.heart} />
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#EAEAEA',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
  },
  textLineLg: {
    width: '80%',
    height: 18,
    borderRadius: 4,
    backgroundColor: '#EAEAEA',
  },
  textLineSm: {
    width: '50%',
    height: 14,
    borderRadius: 4,
    backgroundColor: '#EAEAEA',
    marginTop: 8,
  },
  tag: {
    width: '60%',
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
    marginTop: 12,
  },
  heart: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
    marginLeft: 16,
  }
});

export default FavoriteStoreCardSkeleton;
