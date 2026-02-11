import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Generate hours from 06:00 to 23:00
const HOURS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6; // 6 AM to 11 PM
  return {
    value: `${hour.toString().padStart(2, '0')}:00`,
    label24: `${hour.toString().padStart(2, '0')}:00`,
    label12: `${hour === 12 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
  };
});

// Also add half-hours
const ALL_TIMES: { value: string; label24: string; label12: string }[] = [];
for (let hour = 6; hour <= 23; hour++) {
  ALL_TIMES.push({
    value: `${hour.toString().padStart(2, '0')}:00`,
    label24: `${hour.toString().padStart(2, '0')}:00`,
    label12: `${hour === 12 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
  });
  if (hour < 23) {
    ALL_TIMES.push({
      value: `${hour.toString().padStart(2, '0')}:30`,
      label24: `${hour.toString().padStart(2, '0')}:30`,
      label12: `${hour === 12 ? 12 : hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? 'PM' : 'AM'}`,
    });
  }
}

interface TimePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: string) => void;
  selectedTime: string;
  title: string;
}

const TimePickerSheet: React.FC<TimePickerSheetProps> = ({
  visible,
  onClose,
  onSelect,
  selectedTime,
  title,
}) => {
  const handleSelect = (time: string) => {
    onSelect(time);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouch} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Title */}
          <Text style={styles.sheetTitle}>{title}</Text>

          {/* Time grid */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContainer}
          >
            {ALL_TIMES.map((time) => {
              const isSelected = selectedTime === time.value;
              return (
                <TouchableOpacity
                  key={time.value}
                  style={[
                    styles.timeChip,
                    isSelected && styles.timeChipSelected,
                  ]}
                  onPress={() => handleSelect(time.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeChipText,
                      isSelected && styles.timeChipTextSelected,
                    ]}
                  >
                    {time.label12}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  overlayTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '60%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1c120d',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  scrollArea: {
    paddingHorizontal: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  timeChip: {
    width: (SCREEN_WIDTH - 32 - 30) / 4, // 4 columns with gaps
    paddingVertical: 14,
    backgroundColor: '#f8f6f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e8d7ce',
  },
  timeChipSelected: {
    backgroundColor: '#fff5ed',
    borderColor: '#f46a25',
    borderWidth: 2,
  },
  timeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1c120d',
  },
  timeChipTextSelected: {
    color: '#f46a25',
    fontWeight: 'bold',
  },
});

export default TimePickerSheet;
