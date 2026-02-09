import React, { useState } from 'react';
import { Image, ImageProps, ImageStyle, StyleProp, View, StyleSheet } from 'react-native';
import { getCategoryImage } from '../../theme/images';

interface ProductImageProps extends Omit<ImageProps, 'source'> {
    imageUrl?: string;
    categorySlug?: string;
    style?: StyleProp<ImageStyle>;
}

export const ProductImage: React.FC<ProductImageProps> = ({
    imageUrl,
    categorySlug,
    style,
    ...props
}) => {
    const [error, setError] = useState(false);

    // If we have a URL and haven't encountered an error, use it.
    // Otherwise, fallback to the local category image.
    const source = (imageUrl && !error)
        ? { uri: imageUrl }
        : getCategoryImage(categorySlug);

    return (
        <Image
            {...props}
            source={source}
            style={style}
            onError={() => setError(true)}
        />
    );
};

const styles = StyleSheet.create({
    // Add any default styles if needed
});
