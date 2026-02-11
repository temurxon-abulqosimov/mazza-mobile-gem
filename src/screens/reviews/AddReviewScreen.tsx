import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ImageStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import StarRating from '../../components/StarRating';
import { createReview } from '../../api/reviews';
import { RootStackParamList } from '../../navigation/RootNavigator';

type AddReviewScreenRouteProp = RouteProp<RootStackParamList, 'AddReview'>;

const RATING_EMOJIS = ['😕', '😐', '🙂', '😊', '🤩'];

const AddReviewScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<AddReviewScreenRouteProp>();
  const queryClient = useQueryClient();
  const { bookingId, productName, productImage, storeName } = route.params;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async () => {
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

      // Invalidate queries to refresh UI (hide review button)
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });

      setSubmitted(true);
    } catch (error: any) {
      console.log('Review Error', error);
      const msg = error.response?.data?.message || t('review.submit_error');
      Alert.alert(t('common.error'), msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successEmojiCircle}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          <Text style={styles.successTitle}>{t('review.thank_you')}</Text>
          <Text style={styles.successSubtitle}>{t('review.review_submitted')}</Text>

          <View style={styles.submittedCard}>
            <View style={styles.submittedStars}>
              <StarRating rating={rating} readOnly size={28} />
            </View>
            {comment.trim() ? (
              <Text style={styles.submittedComment}>"{comment.trim()}"</Text>
            ) : null}
            <Text style={styles.submittedStore}>{storeName}</Text>
          </View>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.doneButtonText}>{t('common.done')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('review.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Product info card */}
          <View style={styles.productCard}>
            <Image
              source={{ uri: productImage || 'https://via.placeholder.com/80' }}
              style={styles.productImage as ImageStyle}
            />
            <View style={styles.productDetails}>
              <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
              <Text style={styles.storeName}>{storeName}</Text>
            </View>
          </View>

          {/* Rating section */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionTitle}>{t('review.how_was_experience')}</Text>

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

            {/* Rating label */}
            <Text style={[
              styles.ratingLabel,
              rating > 0 && styles.ratingLabelActive,
            ]}>
              {getRatingLabel(rating)}
            </Text>
          </View>

          {/* Comment section */}
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>{t('review.add_comment')}</Text>
            <Text style={styles.optionalLabel}>{t('review.optional')}</Text>
            <TextInput
              style={styles.commentInput}
              placeholder={t('review.comment_placeholder')}
              placeholderTextColor="#a0a0a0"
              multiline
              numberOfLines={4}
              value={comment}
              onChangeText={setComment}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{comment.length}/500</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Submit button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            rating === 0 && styles.submitButtonDisabled,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || rating === 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>{t('review.submit')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Text style={styles.skipButtonText}>{t('review.maybe_later')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFCFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FCFCFC',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 30,
  },
  // Product card
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 14,
    backgroundColor: '#F5F5F5',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  // Rating section
  ratingSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },
  emojiContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiText: {
    fontSize: 40,
  },
  starsContainer: {
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#aaa',
  },
  ratingLabelActive: {
    color: '#FF7A00',
  },
  // Comment section
  commentSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  optionalLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: -12,
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    borderRadius: 14,
    padding: 16,
    minHeight: 110,
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: '#bbb',
    textAlign: 'right',
    marginTop: 6,
  },
  // Footer
  footer: {
    padding: 20,
    paddingBottom: 36,
    backgroundColor: '#FCFCFC',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
  },
  // Success state
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  successEmojiCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FFF4E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  submittedCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  submittedStars: {
    marginBottom: 12,
  },
  submittedComment: {
    fontSize: 15,
    color: '#555',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  submittedStore: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 14,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AddReviewScreen;
