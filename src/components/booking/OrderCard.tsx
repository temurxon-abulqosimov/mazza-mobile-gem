import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Booking, BookingStatus } from '../../domain/Booking';

interface OrderCardProps {
  booking: Booking;
  onPress: () => void;
  onReviewPress?: () => void;
}

const OrderCard = ({ booking, onPress, onReviewPress }: OrderCardProps) => {
  const { t } = useTranslation();

  const isReadyForPickup = booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.READY_FOR_PICKUP;
  const isCompleted = booking.status === BookingStatus.COMPLETED;
  const isPastOrder = booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.EXPIRED;
  const canReview = isCompleted && !booking.isReviewed && onReviewPress;

  const renderActionButton = () => {
    if (isReadyForPickup) {
      return (
        <TouchableOpacity style={styles.actionButtonPrimary} onPress={onPress}>
          <Ionicons name="qr-code-outline" size={20} color="white" />
          <Text style={styles.actionButtonTextPrimary}>{t('orders.view_pickup_code')}</Text>
        </TouchableOpacity>
      );
    }

    if (isCompleted) {
      return (
        <View style={{ gap: 8 }}>
          <TouchableOpacity style={styles.actionButtonSecondary} onPress={onPress}>
            <Text style={styles.actionButtonTextSecondary}>{t('orders.view_receipt')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isPastOrder) {
      return (
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={onPress}>
          <Text style={styles.actionButtonTextSecondary}>{t('orders.view_receipt')}</Text>
        </TouchableOpacity>
      );
    }

    // Default/other states
    return (
      <TouchableOpacity style={styles.actionButtonSecondary} onPress={onPress}>
        <Ionicons name="eye-outline" size={20} color="#333" />
        <Text style={styles.actionButtonTextSecondary}>{t('orders.view_details')}</Text>
      </TouchableOpacity>
    );
  };

  const StatusBadge = () => (
    <View style={[styles.statusBadge, { backgroundColor: getStatusBackgroundColor(booking.status) }]}>
      <Ionicons name={getStatusIcon(booking.status)} size={14} color={getStatusColor(booking.status)} />
      <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>{booking.statusLabel}</Text>
    </View>
  );

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.infoContainer}>
          <StatusBadge />
          <Text style={styles.storeName}>{booking.store.name}</Text>
          <Text style={styles.productName}>{booking.quantity}x {booking.product.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.discountedPrice}>${(booking.totalPrice / 100).toFixed(2)}</Text>
          </View>
        </View>
        <Image source={{ uri: booking.product.imageUrl }} style={styles.image} />
      </View>

      {/* Review prompt banner — tapping navigates to order detail where review is inline */}
      {canReview && (
        <TouchableOpacity
          style={styles.reviewBanner}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.reviewBannerLeft}>
            <Text style={styles.reviewBannerEmoji}>⭐</Text>
            <View style={styles.reviewBannerTextGroup}>
              <Text style={styles.reviewBannerTitle}>{t('review.enjoyed_order')}</Text>
              <Text style={styles.reviewBannerSubtitle}>{t('review.tap_to_leave_review')}</Text>
            </View>
          </View>
          <View style={styles.reviewBannerArrow}>
            <Ionicons name="chevron-forward" size={20} color="#FF7A00" />
          </View>
        </TouchableOpacity>
      )}

      {/* Reviewed badge */}
      {isCompleted && booking.isReviewed && (
        <View style={styles.reviewedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.reviewedBadgeText}>{t('review.reviewed')}</Text>
        </View>
      )}

      <View style={styles.footer}>
        {renderActionButton()}
      </View>
    </View>
  );
};

// --- Style Helpers ---

const getStatusBackgroundColor = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.READY_FOR_PICKUP:
      return '#FFF4E5'; // Light Orange
    case BookingStatus.COMPLETED:
      return '#E8F5E9'; // Light Green
    default:
      return '#F3F3F3'; // Light Gray
  }
}

const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.READY_FOR_PICKUP:
      return '#FF7A00'; // Orange
    case BookingStatus.COMPLETED:
      return '#4CAF50'; // Green
    default:
      return '#555'; // Gray
  }
}

const getStatusIcon = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.READY_FOR_PICKUP:
      return 'time-outline';
    case BookingStatus.COMPLETED:
      return 'checkmark-circle-outline';
    case BookingStatus.CANCELLED:
    case BookingStatus.EXPIRED:
      return 'close-circle-outline';
    default:
      return 'ellipse-outline';
  }
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  infoContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 8,
  },
  productName: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginLeft: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 16,
  },
  actionButtonPrimary: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButtonSecondary: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  actionButtonTextSecondary: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButtonOutline: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  actionButtonTextOutline: {
    color: '#FF7A00',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Review prompt banner
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF8F0',
    marginHorizontal: 12,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE4CC',
  },
  reviewBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reviewBannerEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  reviewBannerTextGroup: {
    flex: 1,
  },
  reviewBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  reviewBannerSubtitle: {
    fontSize: 12,
    color: '#FF7A00',
    fontWeight: '600',
    marginTop: 2,
  },
  reviewBannerArrow: {
    marginLeft: 8,
  },
  // Reviewed badge
  reviewedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 4,
    gap: 6,
  },
  reviewedBadgeText: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default OrderCard;
