import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme';

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    maxStars?: number;
    size?: number;
    readOnly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRatingChange,
    maxStars = 5,
    size = 24,
    readOnly = false,
}) => {
    const stars = [];

    for (let i = 1; i <= maxStars; i++) {
        const isFilled = i <= rating;
        const isHalf = !isFilled && i - 0.5 <= rating; // Simple logic for now, usually needs more precision

        stars.push(
            <TouchableOpacity
                key={i}
                disabled={readOnly}
                onPress={() => onRatingChange && onRatingChange(i)}
                activeOpacity={0.7}
            >
                <Text style={{ fontSize: size, marginRight: spacing.xs, color: isFilled ? '#FFD700' : '#E0E0E0' }}>
                    {isFilled ? '★' : '☆'}
                </Text>
            </TouchableOpacity>
        );
    }

    return <View style={styles.container}>{stars}</View>;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default StarRating;
