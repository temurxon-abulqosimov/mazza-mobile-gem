import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ImageStyle } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing, typography } from '../../theme';
import StarRating from '../../components/StarRating';
import { createReview } from '../../api/reviews';
import { RootStackParamList } from '../../navigation/RootNavigator';

type AddReviewScreenRouteProp = RouteProp<RootStackParamList, 'AddReview'>;

const AddReviewScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<AddReviewScreenRouteProp>();
    const queryClient = useQueryClient();
    const { bookingId, productId, productName, productImage, storeName } = route.params;

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Validation Error', 'Please select a star rating.');
            return;
        }

        setIsSubmitting(true);
        try {
            await createReview({
                bookingId,
                rating,
                comment,
            });

            // Invalidate queries to refresh UI (hide review button)
            await queryClient.invalidateQueries({ queryKey: ['bookings'] });
            await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });

            Alert.alert('Success', 'Thank you for your review!', [
                {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                },
            ]);
        } catch (error: any) {
            console.log('Review Error', error);
            const msg = error.response?.data?.message || 'Failed to submit review. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Write a Review</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.productInfo}>
                    <Image
                        source={{ uri: productImage || 'https://via.placeholder.com/80' }}
                        style={styles.productImage as ImageStyle}
                    />
                    <View style={styles.productDetails}>
                        <Text style={styles.productName}>{productName}</Text>
                        <Text style={styles.storeName}>{storeName}</Text>
                    </View>
                </View>

                <View style={styles.ratingContainer}>
                    <Text style={styles.label}>How was your experience?</Text>
                    <StarRating rating={rating} onRatingChange={setRating} size={40} />
                    <Text style={styles.ratingText}>
                        {rating === 1 ? 'Poor' :
                            rating === 2 ? 'Fair' :
                                rating === 3 ? 'Good' :
                                    rating === 4 ? 'Very Good' :
                                        rating === 5 ? 'Excellent' : 'Select a rating'}
                    </Text>
                </View>

                <View style={styles.commentContainer}>
                    <Text style={styles.label}>Add a comment (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Tell us what you liked (or didn't like)..."
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, isSubmitting && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color={colors.text.inverse} />
                    ) : (
                        <Text style={styles.submitButtonText}>Submit Review</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60, // Safe area
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    closeButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    closeButtonText: {
        fontSize: 24,
        color: colors.text.primary,
    },
    title: {
        ...typography.h3,
        color: colors.text.primary,
    },
    content: {
        padding: spacing.lg,
    },
    productInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: spacing.radiusMd,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    productImage: {
        width: 60,
        height: 60,
        borderRadius: spacing.radiusSm,
        marginRight: spacing.md,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        ...typography.h4,
        color: colors.text.primary,
        marginBottom: 4,
    },
    storeName: {
        ...typography.caption,
        color: colors.text.secondary,
    },
    ratingContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    label: {
        ...typography.h4,
        color: colors.text.secondary,
        marginBottom: spacing.md,
    },
    ratingText: {
        marginTop: spacing.sm,
        ...typography.body,
        fontWeight: '600',
        color: colors.primary,
    },
    commentContainer: {
        marginBottom: spacing.xxl,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: spacing.radiusMd,
        padding: spacing.md,
        minHeight: 120,
        ...typography.body,
        color: colors.text.primary,
    },
    submitButton: {
        backgroundColor: colors.primary,
        padding: spacing.lg,
        borderRadius: spacing.radiusLg,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    submitButtonText: {
        ...typography.buttonLarge,
        color: colors.text.inverse,
    },
});

export default AddReviewScreen;
