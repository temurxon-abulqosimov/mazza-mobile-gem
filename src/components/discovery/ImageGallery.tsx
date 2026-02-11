import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Text,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../../theme';
import { ProductImage } from '../ui/ProductImage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.85;

export interface GalleryImage {
  url?: string;
  thumbnailUrl?: string;
  source?: ImageSourcePropType;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  onBack?: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  categorySlug?: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onBack,
  onFavorite,
  isFavorite = false,
  categorySlug,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {images.map((image, index) => {
          if (image.source) {
            return (
              <Image
                key={index}
                source={image.source}
                style={styles.image}
                resizeMode="cover"
              />
            );
          }
          return (
            <ProductImage
              key={index}
              imageUrl={image.url || image.thumbnailUrl}
              categorySlug={categorySlug}
              style={styles.image}
              resizeMode="cover"
            />
          );
        })}
      </ScrollView>

      {/* Top gradient for status bar readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)']}
        style={[styles.topGradient, { height: insets.top + 60 }]}
        pointerEvents="none"
      />

      {/* Bottom gradient that blends image into content */}
      <LinearGradient
        colors={['transparent', 'rgba(245,245,245,0.6)', '#F5F5F5']}
        locations={[0, 0.6, 1]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />

      {/* Back Button */}
      {onBack && (
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
      )}

      {/* Favorite Button */}
      {onFavorite && (
        <TouchableOpacity
          style={[styles.favoriteButton, { top: insets.top + 10 }]}
          onPress={onFavorite}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={22}
            color={isFavorite ? '#FF3B30' : '#1A1A1A'}
          />
        </TouchableOpacity>
      )}

      {/* Page Indicators */}
      {images.length > 1 && (
        <View style={styles.indicatorContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    height: IMAGE_HEIGHT,
    position: 'relative',
  },
  image: {
    width,
    height: IMAGE_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  favoriteButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    marginHorizontal: 3,
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 22,
    borderRadius: 4,
  },
});

export default ImageGallery;
