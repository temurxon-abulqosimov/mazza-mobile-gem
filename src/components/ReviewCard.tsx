import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, typography } from '../theme';
import StarRating from './StarRating';
import { Review } from '../api/reviews';

interface ReviewCardProps {
    review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: review.reviewer.avatarUrl || 'https://via.placeholder.com/40' }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{review.reviewer.fullName}</Text>
                    <Text style={styles.date}>{new Date(review.createdAt).toLocaleDateString()}</Text>
                </View>
                <StarRating rating={review.rating} size={16} readOnly />
            </View>
            {review.comment ? (
                <Text style={styles.comment}>{review.comment}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: spacing.radiusMd,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: spacing.sm,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text.primary,
    },
    date: {
        ...typography.caption,
        fontSize: 10,
        color: colors.text.tertiary,
    },
    comment: {
        ...typography.body,
        color: colors.text.secondary,
        lineHeight: 20,
    },
});

export default ReviewCard;
