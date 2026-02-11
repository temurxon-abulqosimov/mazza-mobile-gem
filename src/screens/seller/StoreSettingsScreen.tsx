import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../../hooks/useUserProfile';

const StoreSettingsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { userProfile } = useUserProfile();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('store_settings.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('store_settings.business_info')}</Text>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('store_settings.store_name')}</Text>
            <Text style={styles.infoValue}>{userProfile?.fullName || t('store_settings.not_set')}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('store_settings.phone', 'Phone')}</Text>
            <Text style={styles.infoValue}>{userProfile?.phoneNumber || userProfile?.email || t('store_settings.not_set')}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>{t('store_settings.status')}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{t('store_settings.active')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('store_settings.store_actions')}</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('EditStoreProfile')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionText}>{t('store_settings.edit_business_info')}</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionText}>{t('store_settings.update_location')}</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>⏰</Text>
            <Text style={styles.actionText}>{t('store_settings.business_hours')}</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f6f5',
  },
  header: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#e8d7ce',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
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
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9c6549',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  infoItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8d7ce',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9c6549',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1c120d',
    fontWeight: '500',
  },
  statusBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e8d7ce',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 28,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#1c120d',
    fontWeight: '500',
  },
  actionArrow: {
    fontSize: 20,
    color: '#ccc',
  },
});

export default StoreSettingsScreen;
