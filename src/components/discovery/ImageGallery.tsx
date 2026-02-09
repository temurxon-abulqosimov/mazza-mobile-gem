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
import { colors, spacing } from '../../theme';
import { ProductImage } from '../ui/ProductImage';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.75;

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
  // ...
  const [currentIndex, setCurrentIndex] = useState(0);

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

      {/* Back Button */}
      {onBack && (
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      )}

      {/* Favorite Button */}
      {onFavorite && (
        <TouchableOpacity style={styles.favoriteButton} onPress={onFavorite}>
          <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
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
  backButton: {
    position: 'absolute',
    top: spacing.lg + 40,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.lg + 40,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: colors.card,
    width: 24,
  },
});

export default ImageGallery;
