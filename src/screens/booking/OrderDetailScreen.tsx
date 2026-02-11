import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, ActivityIndicator, Button,
    TouchableOpacity, Image, Linking, TextInput, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRoute, useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useQueryClient } from '@tanstack/react-query';

import { OrdersStackParamList } from '../../navigation/OrdersNavigator';
import { MainTabParamList } from '../../navigation/MainAppNavigator';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useBookingDetail } from '../../hooks/useBookingDetail';
import { BookingStatus } from '../../domain/Booking';
import { createReview } from '../../api/reviews';
import StarRating from '../../components/StarRating';
import { useTranslation } from 'react-i18next';

type OrderDetailProps = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>;
type OrderDetailRouteProp = OrderDetailProps['route'];

type OrderDetailNavigationProp = CompositeNavigationProp<
    NativeStackNavigationProp<OrdersStackParamList, 'OrderDetail'>,
    CompositeNavigationProp<
        BottomTabNavigationProp<MainTabParamList>,
        NativeStackNavigationProp<RootStackParamList>
    >
>;

const RATING_EMOJIS = ['😕', '😐', '🙂', '😊', '🤩'];

const OrderDetailScreen = () => {
    const { t } = useTranslation();
    const route = useRoute<OrderDetailRouteProp>();
    const navigation = useNavigation<OrderDetailNavigationProp>();
    const queryClient = useQueryClient();
    const { bookingId } = route.params;
    const { booking, isLoading, isError, refetch } = useBookingDetail(bookingId);

    // Inline review state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const openMaps = () => {
        if (!booking) return;
        const { lat, lng } = booking.store.location;
        const scheme = 'maps:0,0?q=';
        const latLng = `${lat},${lng}`;
        const label = booking.store.name;
        const url = `${scheme}${label}@${latLng}`;
        Linking.openURL(url);
    };

    const handleSubmitReview = async () => {
        if (rating === 0) {
            Alert.alert(t('review.validation_title'), t('review.validation_rating'));
            return;
        }
        setIsSubmitting(true);
        try {
            await createReview({
                bookingId,
                rating,
                comment: comment.trim() || undefined,
            });
            await queryClient.invalidateQueries({ queryKey: ['bookings'] });
            await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
            setReviewSubmitted(true);
        } catch (error: any) {
            console.log('Review Error', error);
            const msg = error.response?.data?.error?.message || error.response?.data?.message || t('review.submit_error');
            Alert.alert(t('common.error'), msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRatingLabel = (r: number) => {
        switch (r) {
            case 1: return t('review.rating_poor');
            case 2: return t('review.rating_fair');
            case 3: return t('review.rating_good');
            case 4: return t('review.rating_very_good');
            case 5: return t('review.rating_excellent');
            default: return t('review.tap_to_rate');
        }
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" color="#FF7A00" /></View>;
    }

    if (isError || !booking) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{t('orders.could_not_load_detail')}</Text>
                <Button title={t('common.try_again')} onPress={() => refetch()} color="#FF7A00" />
            </View>
        );
    }

    const isCompleted = booking.status === BookingStatus.COMPLETED;
    const isActive = !isCompleted && booking.status !== BookingStatus.CANCELLED && booking.status !== BookingStatus.EXPIRED;
    const canReview = isCompleted && !booking.isReviewed && !reviewSubmitted;
    const hasReviewed = isCompleted && (booking.isReviewed || reviewSubmitted);

    // ──────────────────────────────────────────────
    //  COMPLETED ORDER VIEW (receipt + inline review)
    // ──────────────────────────────────────────────
    if (isCompleted) {
        return (
            <View style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <ScrollView style={styles.container} contentContainerStyle={styles.completedContent} keyboardShouldPersistTaps="handled">
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                                <Ionicons name="arrow-back" size={26} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>{t('orders.order_details')}</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {/* Completed badge */}
                        <View style={styles.completedBadgeContainer}>
                            <View style={styles.completedIcon}>
                                <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
                            </View>
                            <Text style={styles.completedTitle}>{t('orders.order_completed')}</Text>
                            <Text style={styles.completedSubtitle}>
                                {booking.completedAt
                                    ? new Date(booking.completedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                    : ''}
                            </Text>
                        </View>

                        {/* Product card */}
                        <View style={styles.receiptCard}>
                            <View style={styles.receiptProductRow}>
                                <Image source={{ uri: booking.product.imageUrl }} style={styles.receiptProductImage} />
                                <View style={styles.receiptProductInfo}>
                                    <Text style={styles.receiptProductName}>{booking.product.name}</Text>
                                    <Text style={styles.receiptStoreName}>
                                        <Ionicons name="business-outline" size={13} color="#888" /> {booking.store.name}
                                    </Text>
                                    <Text style={styles.receiptQuantity}>{t('orders.quantity')}: {booking.quantity}</Text>
                                </View>
                            </View>

                            <View style={styles.receiptDivider} />

                            {/* Order summary */}
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>{t('orders.order_number')}</Text>
                                <Text style={styles.receiptValue}>{booking.orderNumber}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>{t('orders.pickup_window')}</Text>
                                <Text style={styles.receiptValue}>{booking.pickupWindow.label}</Text>
                            </View>
                            <View style={styles.receiptRow}>
                                <Text style={styles.receiptLabel}>{t('orders.total_paid')}</Text>
                                <Text style={styles.receiptPrice}>${(booking.totalPrice / 100).toFixed(2)}</Text>
                            </View>
                        </View>

                        {/* Store info */}
                        <TouchableOpacity style={styles.storeInfoCard} onPress={openMaps} activeOpacity={0.7}>
                            <View style={styles.storeInfoLeft}>
                                <Ionicons name="location-outline" size={22} color="#FF7A00" />
                                <View style={{ marginLeft: 12, flex: 1 }}>
                                    <Text style={styles.storeInfoName}>{booking.store.name}</Text>
                                    <Text style={styles.storeInfoAddress}>{booking.store.location.address}</Text>
                                </View>
                            </View>
                            <Ionicons name="navigate-outline" size={20} color="#FF7A00" />
                        </TouchableOpacity>

                        {/* ── INLINE REVIEW SECTION ── */}
                        {canReview && (
                            <View style={styles.reviewSection}>
                                <View style={styles.reviewSectionHeader}>
                                    <Text style={styles.reviewSectionEmoji}>⭐</Text>
                                    <View>
                                        <Text style={styles.reviewSectionTitle}>{t('review.how_was_experience')}</Text>
                                        <Text style={styles.reviewSectionSubtitle}>{t('review.tap_to_leave_review')}</Text>
                                    </View>
                                </View>

                                {/* Emoji indicator */}
                                <View style={styles.emojiContainer}>
                                    <Text style={styles.emojiText}>
                                        {rating > 0 ? RATING_EMOJIS[rating - 1] : '⭐'}
                                    </Text>
                                </View>

                                {/* Stars */}
                                <View style={styles.starsContainer}>
                                    <StarRating rating={rating} onRatingChange={setRating} size={44} />
                                </View>
                                <Text style={[styles.ratingLabel, rating > 0 && styles.ratingLabelActive]}>
                                    {getRatingLabel(rating)}
                                </Text>

                                {/* Comment input */}
                                <View style={styles.commentBox}>
                                    <TextInput
                                        style={styles.commentInput}
                                        placeholder={t('review.comment_placeholder')}
                                        placeholderTextColor="#a0a0a0"
                                        multiline
                                        numberOfLines={3}
                                        value={comment}
                                        onChangeText={setComment}
                                        textAlignVertical="top"
                                        maxLength={500}
                                    />
                                    <Text style={styles.charCount}>{comment.length}/500</Text>
                                </View>

                                {/* Submit button */}
                                <TouchableOpacity
                                    style={[
                                        styles.submitReviewButton,
                                        (rating === 0 || isSubmitting) && styles.submitReviewButtonDisabled,
                                    ]}
                                    onPress={handleSubmitReview}
                                    disabled={isSubmitting || rating === 0}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.submitReviewButtonText}>{t('review.submit')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Review submitted success */}
                        {hasReviewed && (
                            <View style={styles.reviewedSection}>
                                <View style={styles.reviewedIconCircle}>
                                    <Text style={styles.reviewedSuccessEmoji}>🎉</Text>
                                </View>
                                <Text style={styles.reviewedTitle}>{t('review.thank_you')}</Text>
                                <Text style={styles.reviewedSubtitle}>{t('review.review_submitted')}</Text>
                                {reviewSubmitted && rating > 0 && (
                                    <View style={styles.reviewedStarsCard}>
                                        <StarRating rating={rating} readOnly size={24} />
                                        {comment.trim() ? (
                                            <Text style={styles.reviewedComment}>"{comment.trim()}"</Text>
                                        ) : null}
                                    </View>
                                )}
                            </View>
                        )}

                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Footer */}
                <View style={styles.completedFooter}>
                    <TouchableOpacity style={styles.homeButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.homeButtonText}>{t('orders.back_to_orders')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // ──────────────────────────────────────────────
    //  ACTIVE ORDER VIEW (QR code + pickup info)
    // ──────────────────────────────────────────────
    return (
        <View style={styles.safeArea}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('orders.confirmation')}</Text>
                    <View style={{ width: 40 }} />
                </View>

                <View style={styles.confirmationContainer}>
                    <View style={styles.checkCircle}>
                        <Ionicons name="checkmark-sharp" size={32} color="#FF7A00" />
                    </View>
                    <Text style={styles.woohooText}>{t('orders.order_confirmed')}</Text>
                    <Text style={styles.subText}>
                        {t('orders.show_code_msg', { storeName: booking.store.name })}
                    </Text>
                </View>

                <View style={styles.qrCard}>
                    <Text style={styles.scanText}>{t('orders.scan_at_pickup')}</Text>
                    <View style={styles.qrContainer}>
                        {booking.qrCodeData ? (
                            <QRCode
                                value={booking.qrCodeData}
                                size={150}
                                backgroundColor='transparent'
                            />
                        ) : null}
                    </View>
                    <Text style={styles.orderNumber}>{booking.orderNumber}</Text>
                    <Text style={styles.paidStatus}>
                        <Ionicons name="checkmark-circle" size={14} color="#4CAF50" /> {t('orders.paid_confirmed')}
                    </Text>
                </View>

                <View style={styles.pickupCard}>
                    <Ionicons name="time-outline" size={24} color="#FF7A00" style={{ marginRight: 12 }} />
                    <View>
                        <Text style={styles.cardTitle}>{t('orders.pickup_window')}</Text>
                        <Text style={styles.pickupTime}>{booking.pickupWindow.label}</Text>
                    </View>
                    <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>{booking.pickupWindow.dateLabel}</Text>
                    </View>
                </View>

                <View style={styles.storeCard}>
                    <Image source={{ uri: booking.product.imageUrl }} style={styles.storeImage} />
                    <View style={styles.storeInfo}>
                        <Text style={styles.storeName}><Ionicons name="business-outline" size={14} /> {booking.store.name}</Text>
                        <Text style={styles.storeAddress}>{booking.store.location.address}</Text>
                        <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
                            <Ionicons name="navigate-outline" size={20} color="white" />
                            <Text style={styles.directionsText}>{t('orders.get_directions')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity onPress={() => { /* Contact Support */ }}>
                    <Text style={styles.supportText}>{t('orders.contact_support')}</Text>
                </TouchableOpacity>

            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('MainApp' as never)}>
                    <Text style={styles.homeButtonText}>{t('orders.back_to_home')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FCFCFC' },
    container: { flex: 1 },
    contentContainer: { paddingBottom: 100 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FCFCFC' },
    errorText: { fontSize: 16, color: '#D32F2F', marginBottom: 10 },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 54, paddingBottom: 16 },
    closeButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#1A1A1A' },

    // Active order - confirmation
    confirmationContainer: { alignItems: 'center', paddingHorizontal: 30, marginTop: 10 },
    checkCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF4E5', justifyContent: 'center', alignItems: 'center' },
    woohooText: { fontSize: 28, fontWeight: 'bold', marginTop: 20 },
    subText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 },

    // QR card
    qrCard: { margin: 20, padding: 20, backgroundColor: 'white', borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    scanText: { fontSize: 12, color: '#AAA', fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
    qrContainer: { padding: 10, backgroundColor: 'white', borderRadius: 8, elevation: 2 },
    orderNumber: { fontSize: 22, fontWeight: 'bold', marginTop: 15 },
    paidStatus: { fontSize: 14, color: '#4CAF50', marginTop: 5 },

    // Pickup card
    pickupCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', marginHorizontal: 20, padding: 20, borderRadius: 16, elevation: 2 },
    cardTitle: { fontSize: 12, color: '#AAA', fontWeight: 'bold', letterSpacing: 1 },
    pickupTime: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 4 },
    todayBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 'auto' },
    todayText: { color: '#4CAF50', fontWeight: 'bold' },

    // Store card (active view)
    storeCard: { backgroundColor: 'white', margin: 20, borderRadius: 16, elevation: 2, overflow: 'hidden' },
    storeImage: { height: 120, width: '100%' },
    storeInfo: { padding: 20 },
    storeName: { fontSize: 18, fontWeight: 'bold' },
    storeAddress: { fontSize: 14, color: '#666', marginVertical: 8 },
    directionsButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF7A00', paddingVertical: 14, borderRadius: 12, marginTop: 10 },
    directionsText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
    supportText: { textAlign: 'center', color: '#888', marginVertical: 20 },

    // Footer (active)
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: '#FCFCFC', borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 12 },
    homeButton: { backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA' },
    homeButtonText: { textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#333' },

    // ── COMPLETED ORDER STYLES ──
    completedContent: { paddingBottom: 120 },
    completedBadgeContainer: { alignItems: 'center', paddingHorizontal: 30, marginTop: 4, marginBottom: 20 },
    completedIcon: { marginBottom: 12 },
    completedTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A' },
    completedSubtitle: { fontSize: 14, color: '#888', marginTop: 6 },

    // Receipt card
    receiptCard: {
        backgroundColor: 'white', marginHorizontal: 20, borderRadius: 16, padding: 20,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
        borderWidth: 1, borderColor: '#F0F0F0',
    },
    receiptProductRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    receiptProductImage: { width: 72, height: 72, borderRadius: 14, backgroundColor: '#F5F5F5' },
    receiptProductInfo: { flex: 1, marginLeft: 14 },
    receiptProductName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
    receiptStoreName: { fontSize: 14, color: '#888', marginBottom: 4 },
    receiptQuantity: { fontSize: 13, color: '#666' },
    receiptDivider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
    receiptRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 },
    receiptLabel: { fontSize: 14, color: '#888' },
    receiptValue: { fontSize: 14, fontWeight: '600', color: '#333' },
    receiptPrice: { fontSize: 18, fontWeight: 'bold', color: '#FF7A00' },

    // Store info card (completed view)
    storeInfoCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: 'white', marginHorizontal: 20, marginTop: 14, padding: 16, borderRadius: 14,
        borderWidth: 1, borderColor: '#F0F0F0',
    },
    storeInfoLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    storeInfoName: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
    storeInfoAddress: { fontSize: 13, color: '#888', marginTop: 2 },

    // ── INLINE REVIEW SECTION ──
    reviewSection: {
        backgroundColor: 'white', marginHorizontal: 20, marginTop: 20, borderRadius: 20, padding: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
        borderWidth: 1, borderColor: '#F0F0F0', alignItems: 'center',
    },
    reviewSectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, alignSelf: 'flex-start' },
    reviewSectionEmoji: { fontSize: 28, marginRight: 12 },
    reviewSectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
    reviewSectionSubtitle: { fontSize: 13, color: '#FF7A00', fontWeight: '600', marginTop: 2 },
    emojiContainer: { width: 68, height: 68, borderRadius: 34, backgroundColor: '#FFF8F0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emojiText: { fontSize: 36 },
    starsContainer: { marginBottom: 10 },
    ratingLabel: { fontSize: 15, fontWeight: '600', color: '#aaa', marginBottom: 20 },
    ratingLabelActive: { color: '#FF7A00' },
    commentBox: { width: '100%', marginBottom: 16 },
    commentInput: {
        backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#EBEBEB', borderRadius: 14,
        padding: 14, minHeight: 90, fontSize: 15, color: '#1A1A1A', lineHeight: 22,
    },
    charCount: { fontSize: 12, color: '#bbb', textAlign: 'right', marginTop: 6 },
    submitReviewButton: { backgroundColor: '#FF7A00', paddingVertical: 16, borderRadius: 14, alignItems: 'center', width: '100%' },
    submitReviewButtonDisabled: { opacity: 0.5 },
    submitReviewButtonText: { fontSize: 17, fontWeight: 'bold', color: 'white' },

    // ── REVIEWED SUCCESS ──
    reviewedSection: {
        backgroundColor: 'white', marginHorizontal: 20, marginTop: 20, borderRadius: 20, padding: 28,
        alignItems: 'center', borderWidth: 1, borderColor: '#E8F5E9',
    },
    reviewedIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF4E5', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
    reviewedSuccessEmoji: { fontSize: 32 },
    reviewedTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
    reviewedSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 12 },
    reviewedStarsCard: { alignItems: 'center', marginTop: 8 },
    reviewedComment: { fontSize: 14, color: '#555', fontStyle: 'italic', textAlign: 'center', marginTop: 8 },

    // Completed footer
    completedFooter: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36,
        backgroundColor: '#FCFCFC', borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
});

export default OrderDetailScreen;
