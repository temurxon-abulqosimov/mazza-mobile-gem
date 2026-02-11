import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useCreateProduct, useUpdateProduct } from '../../hooks/useCreateProduct';
import { CATEGORY_IMAGES } from '../../theme/images';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AddProductScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const productToEdit = route.params?.product;
  const isEditMode = !!productToEdit;

  const { t } = useTranslation();
  const { createProduct, isCreating } = useCreateProduct();
  const { updateProduct, isUpdating } = useUpdateProduct();

  // Product categories for sellers (excludes cafe/restaurant which are business types)
  const PRODUCT_CATEGORIES = [
    { id: 'bakery', name: t('seller.categories.bakery'), slug: 'bakery', image: CATEGORY_IMAGES.bakery },
    { id: 'desserts', name: t('seller.categories.desserts'), slug: 'desserts', image: CATEGORY_IMAGES.desserts },
    { id: 'fast-food', name: t('seller.categories.fast_food'), slug: 'fast-food', image: CATEGORY_IMAGES['fast-food'] },
    { id: 'traditional', name: t('seller.categories.traditional'), slug: 'traditional', image: CATEGORY_IMAGES.traditional },
    { id: 'salad', name: t('seller.categories.salad'), slug: 'salad', image: CATEGORY_IMAGES.salad },
  ];

  // Form state
  // ... (rest of the file content with t() replacements)

  // ... existing useState initializers ...
  // Form state - Initialize with product data if editing
  const [name, setName] = useState(productToEdit?.name || '');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState(productToEdit?.categoryId || '');
  // Helper to safely convert price from cents to dollars string
  const formatPrice = (priceCent: number) => (priceCent ? (priceCent / 100).toFixed(2) : '');

  const [originalPrice, setOriginalPrice] = useState(
    productToEdit ? formatPrice(productToEdit.originalPrice) : ''
  );
  const [salePrice, setSalePrice] = useState(
    productToEdit ? formatPrice(productToEdit.discountedPrice) : ''
  );
  const [quantity, setQuantity] = useState(productToEdit?.quantity || 1);

  // Calculate default pickup times using useState initializer function
  const [pickupStart, setPickupStart] = useState(() => {
    if (productToEdit?.pickupWindowStart) {
      // Assuming format HH:MM or ISO string. Backend usually sends ISO.
      // If ISO, extract HH:MM. If HH:MM, use as is.
      const time = new Date(productToEdit.pickupWindowStart);
      if (!isNaN(time.getTime())) {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      return '12:00'; // Fallback
    }
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const hours = startTime.getHours().toString().padStart(2, '0');
    const minutes = startTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  const [pickupEnd, setPickupEnd] = useState(() => {
    if (productToEdit?.pickupWindowEnd) {
      const time = new Date(productToEdit.pickupWindowEnd);
      if (!isNaN(time.getTime())) {
        const hours = time.getHours().toString().padStart(2, '0');
        const minutes = time.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      return '17:00'; // Fallback
    }
    const now = new Date();
    const endTime = new Date(now.getTime() + 5 * 60 * 60 * 1000); // 5 hours from now
    const hours = endTime.getHours().toString().padStart(2, '0');
    const minutes = endTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  const handleIncrement = () => setQuantity(prev => prev + 1);
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleTimeChange = (type: 'start' | 'end', increment: boolean) => {
    const currentTime = type === 'start' ? pickupStart : pickupEnd;
    const [hours, minutes] = currentTime.split(':').map(Number);

    let newHours = hours;
    let newMinutes = minutes;

    if (increment) {
      newMinutes += 30;
      if (newMinutes >= 60) {
        newMinutes = 0;
        newHours = (newHours + 1) % 24;
      }
    } else {
      newMinutes -= 30;
      if (newMinutes < 0) {
        newMinutes = 30;
        newHours = newHours === 0 ? 23 : newHours - 1;
      }
    }

    const newTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;

    if (type === 'start') {
      setPickupStart(newTime);
    } else {
      setPickupEnd(newTime);
    }
  };

  const calculateDuration = (start: string, end: string) => {
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);

    let duration = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    if (duration < 0) duration += 24 * 60; // Handle overnight

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours} hours`;
    return `${minutes} minutes`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert(t('seller.missing_info'), t('seller.enter_product_name'));
      return;
    }

    if (!description.trim()) {
      Alert.alert(t('seller.missing_info'), t('seller.enter_description'));
      return;
    }

    const originalPriceNum = parseFloat(originalPrice);
    const salePriceNum = parseFloat(salePrice);

    if (!originalPrice || isNaN(originalPriceNum) || originalPriceNum <= 0) {
      Alert.alert(t('seller.invalid_price'), t('seller.enter_valid_original_price'));
      return;
    }

    if (!salePrice || isNaN(salePriceNum) || salePriceNum <= 0) {
      Alert.alert(t('seller.invalid_price'), t('seller.enter_valid_sale_price'));
      return;
    }

    if (salePriceNum >= originalPriceNum) {
      Alert.alert(t('seller.invalid_price'), t('seller.sale_price_error'));
      return;
    }

    if (quantity < 1) {
      Alert.alert(t('seller.invalid_quantity'), t('seller.quantity_error'));
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert(t('seller.missing_info'), t('seller.select_category_error'));
      return;
    }

    // Validate pickup times
    const now = new Date();
    const [startHours, startMinutes] = pickupStart.split(':').map(Number);
    const [endHours, endMinutes] = pickupEnd.split(':').map(Number);

    const startTime = new Date(now);
    startTime.setHours(startHours, startMinutes, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(endHours, endMinutes, 0, 0);

    // If start time is in the past, move it to tomorrow
    if (startTime <= now) {
      startTime.setDate(startTime.getDate() + 1);
    }

    // If end time is before start time, move it to the next day
    if (endTime <= startTime) {
      endTime.setDate(startTime.getDate() + 1);
    }

    // Check if start time is at least 30 minutes in the future
    const minFutureTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    if (startTime < minFutureTime) {
      Alert.alert(
        t('seller.invalid_pickup_time'),
        t('seller.pickup_time_error')
      );
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        originalPrice: Math.round(originalPriceNum * 100), // Convert dollars to cents
        discountedPrice: Math.round(salePriceNum * 100), // Convert dollars to cents
        quantity,
        categoryId: selectedCategoryId,
        pickupWindowStart: pickupStart,
        pickupWindowEnd: pickupEnd,
      };

      console.log(`${isEditMode ? 'Updating' : 'Creating'} product with payload:`, JSON.stringify(payload, null, 2));

      if (isEditMode) {
        await updateProduct({ id: productToEdit.id, payload });
        Alert.alert(
          t('common.success'),
          t('seller.success_product_updated'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        await createProduct(payload);
        Alert.alert(
          t('common.success'),
          t('seller.success_product_created'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Product creation error:', error);
      console.error('Error response:', JSON.stringify(error.response?.data, null, 2));

      // Extract detailed error message
      let errorMessage = 'Failed to create product. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;

        // If there are validation errors, show them
        if (Array.isArray(error.response.data.message)) {
          errorMessage = error.response.data.message.join('\n');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(t('common.error'), errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          disabled={isCreating}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? t('seller.edit_listing') : t('seller.new_listing')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Category Selection - Visual Grid */}
        <View style={styles.categorySectionHeader}>
          <Text style={styles.categorySectionTitle}>{t('seller.select_category')}</Text>
          <Text style={styles.categorySectionSubtitle}>{t('seller.category_subtitle')}</Text>
        </View>

        <View style={styles.categoryImageGrid}>
          {PRODUCT_CATEGORIES.map((cat, index) => {
            const isSelected = selectedCategoryId === cat.id;
            const isLastOdd = index === PRODUCT_CATEGORIES.length - 1 && PRODUCT_CATEGORIES.length % 2 !== 0;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryImageCard,
                  isSelected && styles.categoryImageCardSelected,
                  isLastOdd && styles.categoryImageCardFull,
                ]}
                onPress={() => setSelectedCategoryId(cat.id)}
                activeOpacity={0.8}
                disabled={isCreating}
              >
                <Image source={cat.image} style={styles.categoryImage} />
                <View style={styles.categoryImageOverlay} />
                <Text style={styles.categoryImageLabel}>{cat.name}</Text>
                {isSelected && (
                  <View style={styles.categoryImageCheck}>
                    <Text style={styles.categoryImageCheckText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Product Details */}
        <View style={styles.formSection}>
          {/* Item Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('seller.item_name')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('seller.item_name_placeholder')}
              placeholderTextColor="#9c6549"
              value={name}
              onChangeText={setName}
              editable={!isCreating}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('seller.description')}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder={t('seller.description_placeholder')}
              placeholderTextColor="#9c6549"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              editable={!isCreating}
            />
          </View>
        </View>

        {/* Pricing & Stock Card */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingCardTitle}>{t('seller.pricing_stock')}</Text>

          <View style={styles.priceRow}>
            <View style={styles.priceInputGroup}>
              <Text style={styles.priceLabel}>{t('seller.original_price')}</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor="#9c6549"
                  keyboardType="decimal-pad"
                  value={originalPrice}
                  onChangeText={setOriginalPrice}
                  editable={!isCreating}
                />
              </View>
            </View>

            <View style={styles.priceInputGroup}>
              <View style={styles.priceLabelRow}>
                <Text style={styles.priceLabel}>{t('seller.sale_price')}</Text>
                {originalPrice && salePrice && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>
                      {Math.round(((parseFloat(originalPrice) - parseFloat(salePrice)) / parseFloat(originalPrice)) * 100)}% {t('seller.off')}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor="#9c6549"
                  keyboardType="decimal-pad"
                  value={salePrice}
                  onChangeText={setSalePrice}
                  editable={!isCreating}
                />
              </View>
            </View>
          </View>

          <View style={styles.quantityGroup}>
            <Text style={styles.priceLabel}>{t('seller.quantity')}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleDecrement}
                disabled={isCreating || quantity <= 1}
              >
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={handleIncrement}
                disabled={isCreating}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pickup Time */}
        <View style={styles.timeSection}>
          <Text style={styles.inputLabel}>{t('seller.pickup_window')}</Text>
          <Text style={styles.helpText}>{t('seller.pickup_subtitle')}</Text>

          {/* Visual Timeline */}
          <View style={styles.timelineContainer}>
            <View style={styles.timelineBar}>
              <View style={styles.timelineTrack} />
              <View style={styles.timelineActiveSegment} />

              {/* Start Time Marker */}
              <View style={styles.timeMarkerStart}>
                <View style={styles.timeMarkerDot} />
                <View style={styles.timeMarkerLabel}>
                  <Text style={styles.timeMarkerLabelText}>{t('seller.start')}</Text>
                  <Text style={styles.timeMarkerTime}>{formatTimeDisplay(pickupStart)}</Text>
                </View>
              </View>

              {/* End Time Marker */}
              <View style={styles.timeMarkerEnd}>
                <View style={styles.timeMarkerDot} />
                <View style={styles.timeMarkerLabel}>
                  <Text style={styles.timeMarkerLabelText}>{t('seller.end')}</Text>
                  <Text style={styles.timeMarkerTime}>{formatTimeDisplay(pickupEnd)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Time Adjusters */}
          <View style={styles.timeAdjustersRow}>
            <View style={styles.timeAdjusterGroup}>
              <View style={styles.timeAdjusterHeader}>
                <Text style={styles.timeAdjusterIcon}>🕐</Text>
                <Text style={styles.timeAdjusterTitle}>{t('seller.start_time')}</Text>
              </View>
              <View style={styles.timeControls}>
                <TouchableOpacity
                  style={styles.timeControlButton}
                  onPress={() => handleTimeChange('start', false)}
                  disabled={isCreating}
                >
                  <Text style={styles.timeControlButtonText}>−30m</Text>
                </TouchableOpacity>
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeDisplayLarge}>{formatTimeDisplay(pickupStart)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeControlButton}
                  onPress={() => handleTimeChange('start', true)}
                  disabled={isCreating}
                >
                  <Text style={styles.timeControlButtonText}>+30m</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.timeAdjusterGroup}>
              <View style={styles.timeAdjusterHeader}>
                <Text style={styles.timeAdjusterIcon}>🕐</Text>
                <Text style={styles.timeAdjusterTitle}>{t('seller.end_time')}</Text>
              </View>
              <View style={styles.timeControls}>
                <TouchableOpacity
                  style={styles.timeControlButton}
                  onPress={() => handleTimeChange('end', false)}
                  disabled={isCreating}
                >
                  <Text style={styles.timeControlButtonText}>−30m</Text>
                </TouchableOpacity>
                <View style={styles.timeDisplay}>
                  <Text style={styles.timeDisplayLarge}>{formatTimeDisplay(pickupEnd)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeControlButton}
                  onPress={() => handleTimeChange('end', true)}
                  disabled={isCreating}
                >
                  <Text style={styles.timeControlButtonText}>+30m</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Duration Info */}
          <View style={styles.durationInfo}>
            <Text style={styles.durationIcon}>⏱️</Text>
            <Text style={styles.durationText}>
              {t('seller.pickup_duration')} {calculateDuration(pickupStart, pickupEnd)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity
          style={[styles.submitButton, isCreating && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>{isEditMode ? t('seller.update_listing') : t('seller.publish_listing')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f5',
  },
  header: {
    backgroundColor: '#f8f6f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e8d7ce',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#1c120d',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c120d',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  // Category Selection Styles
  categorySectionHeader: {
    marginBottom: 16,
  },
  categorySectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1c120d',
    marginBottom: 4,
  },
  categorySectionSubtitle: {
    fontSize: 14,
    color: '#9c6549',
  },
  categoryImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  categoryImageCard: {
    width: (SCREEN_WIDTH - 44) / 2, // 16 padding on each side + 12 gap
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  categoryImageCardFull: {
    width: SCREEN_WIDTH - 32, // Full width for last odd item
    height: 120,
  },
  categoryImageCardSelected: {
    borderColor: '#ff7a33',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  categoryImageLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  categoryImageCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ff7a33',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  categoryImageCheckText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e8d7ce',
    borderRadius: 16,
    backgroundColor: 'white',
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff5ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIconText: {
    fontSize: 28,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c120d',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: '#9c6549',
  },
  quickSelectSection: {
    marginBottom: 24,
  },
  quickSelectTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9c6549',
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickSelectScroll: {
    flexDirection: 'row',
  },
  quickSelectItem: {
    alignItems: 'center',
    marginRight: 12,
  },
  quickSelectImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#fff5ed',
    borderWidth: 2,
    borderColor: '#e8d7ce',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickSelectImageContainerSelected: {
    backgroundColor: '#fff5ed',
    borderColor: '#f46a25',
    borderWidth: 3,
    shadowColor: '#f46a25',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    transform: [{ scale: 1.05 }],
  },
  quickSelectImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
  },
  selectedUploadImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  quickSelectEmoji: {
    fontSize: 32,
  },
  quickSelectEmojiSelected: {
    fontSize: 36,
  },
  quickSelectCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#f46a25',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f46a25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  quickSelectCheckText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  quickSelectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c120d',
  },
  quickSelectLabelSelected: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f46a25',
  },
  formSection: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1c120d',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e8d7ce',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1c120d',
  },
  textArea: {
    minHeight: 90,
    paddingTop: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e8d7ce',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardSelected: {
    backgroundColor: '#fff5ed',
    borderColor: '#f46a25',
    borderWidth: 3,
    shadowColor: '#f46a25',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryCardContent: {
    alignItems: 'center',
    position: 'relative',
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c120d',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: '#f46a25',
    fontWeight: 'bold',
  },
  categoryCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  categoryCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f46a25',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  categoryCheckText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f46a25',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f46a25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryCardSelectedReadOnly: {
    backgroundColor: '#fff5ed',
    borderColor: '#f46a25',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryCardContentHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIconSmall: {
    fontSize: 24,
  },
  autoSelectBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f46a25',
  },
  autoSelectText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#c2410c',
  },
  checkmark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  pricingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e8d7ce',
  },
  pricingCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c120d',
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  priceInputGroup: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9c6549',
    letterSpacing: 1,
    marginBottom: 8,
  },
  priceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e8d7ce',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#9c6549',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c120d',
    paddingVertical: 12,
  },
  quantityGroup: {
    marginBottom: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f46a25',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  quantityValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c120d',
    minWidth: 30,
    textAlign: 'center',
  },
  timeSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e8d7ce',
  },
  timelineContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  timelineBar: {
    height: 60,
    position: 'relative',
    justifyContent: 'center',
  },
  timelineTrack: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: '#e8d7ce',
    borderRadius: 2,
  },
  timelineActiveSegment: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 4,
    backgroundColor: '#f46a25',
    borderRadius: 2,
  },
  timeMarkerStart: {
    position: 'absolute',
    left: 10,
    alignItems: 'center',
  },
  timeMarkerEnd: {
    position: 'absolute',
    right: 10,
    alignItems: 'center',
  },
  timeMarkerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f46a25',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#f46a25',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeMarkerLabel: {
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: '#fff5ed',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f46a25',
  },
  timeMarkerLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9c6549',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeMarkerTime: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f46a25',
    marginTop: 2,
  },
  timeAdjustersRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  timeAdjusterGroup: {
    flex: 1,
    backgroundColor: '#f8f6f5',
    borderRadius: 12,
    padding: 12,
    minHeight: 110, // Ensure enough height
    justifyContent: 'center',
  },
  timeAdjusterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // More space
    gap: 6,
    justifyContent: 'center', // Center title
  },
  timeAdjusterIcon: {
    fontSize: 16,
  },
  timeAdjusterTitle: {
    fontSize: 14, // Larger title
    fontWeight: '600',
    color: '#1c120d',
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // More gap
    justifyContent: 'space-between', // Distribute evenly
  },
  timeControlButton: {
    paddingHorizontal: 12,
    paddingVertical: 10, // Taller button
    backgroundColor: '#f46a25',
    borderRadius: 8,
    minWidth: 44, // Minimum touch target width
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeControlButtonText: {
    fontSize: 14, // Larger text
    fontWeight: 'bold',
    color: 'white',
  },
  timeDisplay: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8d7ce',
    marginHorizontal: 4, // Spacing from buttons
  },
  timeDisplayLarge: {
    fontSize: 16, // Larger time font
    fontWeight: 'bold',
    color: '#1c120d',
    letterSpacing: 0.5,
  },
  durationInfo: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dcfce7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  durationIcon: {
    fontSize: 16,
  },
  durationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  helpText: {
    fontSize: 12,
    color: '#9c6549',
    marginBottom: 12,
  },
  bottomSpacer: {
    height: 100,
  },
  submitContainer: {
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#e8d7ce',
  },
  submitButton: {
    backgroundColor: '#f46a25',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  emptyState: {
    backgroundColor: '#fff5ed',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8d7ce',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9c6549',
    textAlign: 'center',
  },
});

export default AddProductScreen;
