import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getStoreReviews, Review } from '../api/reviews';
import ReviewCard from './ReviewCard';
import { colors, spacing, typography } from '../theme';

interface ReviewsListProps {
    storeId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ storeId }) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['reviews', storeId],
        queryFn: () => getStoreReviews(storeId),
    });

    if (isLoading) {
        return <ActivityIndicator size="small" color={colors.primary} style={{ margin: spacing.lg }} />;
    }

    if (error) {
        console.error('Failed to load reviews:', error);
        return <Text style={styles.errorText}>Failed to load reviews.</Text>;
    }

    let reviews = data?.data || [];

    // Detailed check and transformation
    if (!Array.isArray(reviews)) {
        const responseData = data as any;
        // Check if data itself is the array (some API clients unwrap it)
        if (Array.isArray(responseData)) {
            reviews = responseData;
        }
        // Check for { reviews: [...] } structure
        else if (responseData?.reviews && Array.isArray(responseData.reviews)) {
            reviews = responseData.reviews;
        }
        // Check for nested data.data structure
        else if (responseData?.data && Array.isArray(responseData.data)) {
            reviews = responseData.data;
        }
        else {
            console.warn('ReviewsList: Expected array but got:', typeof reviews);
            reviews = [];
        }
    }

    if (reviews.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No reviews yet.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reviews ({data?.meta?.pagination?.total || reviews.length})</Text>
            {reviews.map((review: Review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
            {/* We are mapping instead of FlatList because this is likely to be inside a ScrollView */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: spacing.lg,
    },
    title: {
        ...typography.h4,
        marginBottom: spacing.md,
        color: colors.text.primary,
    },
    emptyContainer: {
        padding: spacing.lg,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.text.tertiary,
    },
    errorText: {
        color: colors.error,
        textAlign: 'center',
        margin: spacing.md,
    },
});

export default ReviewsList;
