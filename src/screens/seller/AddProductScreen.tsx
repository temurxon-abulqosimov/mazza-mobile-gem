import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AddProductScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState('Restaurant');

  const quickSelectImages = [
    { label: 'Bakery', emoji: '🥐' },
    { label: 'Pizza', emoji: '🍕' },
    { label: 'Salad', emoji: '🥗' },
    { label: 'Sushi', emoji: '🍱' },
    { label: 'Grocery', emoji: '🛒' },
  ];

  const categories = ['Restaurant', 'Cafe', 'Grocery', 'Bakery'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Listing</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Uploader */}
        <TouchableOpacity style={styles.uploadArea}>
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadIconText}>📷</Text>
          </View>
          <Text style={styles.uploadTitle}>Upload Food Photo</Text>
          <Text style={styles.uploadSubtitle}>Tap to upload or select a suggestion below</Text>
        </TouchableOpacity>

        {/* Quick Select Images */}
        <View style={styles.quickSelectSection}>
          <Text style={styles.quickSelectTitle}>QUICK SELECT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickSelectScroll}>
            {quickSelectImages.map((item, index) => (
              <TouchableOpacity key={index} style={styles.quickSelectItem}>
                <View style={styles.quickSelectImageContainer}>
                  <Text style={styles.quickSelectEmoji}>{item.emoji}</Text>
                </View>
                <Text style={styles.quickSelectLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Details */}
        <View style={styles.formSection}>
          {/* Item Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Surprise Bag"
              placeholderTextColor="#9c6549"
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="What's in the bag? Mention any allergens."
              placeholderTextColor="#9c6549"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Business Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Business Type</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategory === category && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Pricing & Stock Card */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingCardTitle}>Pricing & Stock</Text>

          <View style={styles.priceRow}>
            <View style={styles.priceInputGroup}>
              <Text style={styles.priceLabel}>ORIGINAL PRICE</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor="#9c6549"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.priceInputGroup}>
              <View style={styles.priceLabelRow}>
                <Text style={styles.priceLabel}>SALE PRICE</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>50% off</Text>
                </View>
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor="#9c6549"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.quantityGroup}>
            <Text style={styles.priceLabel}>QUANTITY</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>1</Text>
              <TouchableOpacity style={styles.quantityButton}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Pickup Time */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pickup Time</Text>
            <View style={styles.timeRow}>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>From</Text>
                <TouchableOpacity style={styles.timeButton}>
                  <Text style={styles.timeButtonText}>09:00 AM</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timeInputGroup}>
                <Text style={styles.timeLabel}>To</Text>
                <TouchableOpacity style={styles.timeButton}>
                  <Text style={styles.timeButtonText}>05:00 PM</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Publish Listing</Text>
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
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickSelectEmoji: {
    fontSize: 32,
  },
  quickSelectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c120d',
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e8d7ce',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#f46a25',
    borderColor: '#f46a25',
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1c120d',
  },
  categoryButtonTextActive: {
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
  timeRow: {
    flexDirection: 'row',
    gap: 16,
  },
  timeInputGroup: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#9c6549',
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e8d7ce',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  timeButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1c120d',
    textAlign: 'center',
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
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AddProductScreen;
