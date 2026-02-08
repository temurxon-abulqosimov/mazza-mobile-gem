import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
// import i18n from '../../localization/i18n'; // Assuming initialized instance or useTranslation hook

import { Header } from '../../components/layout/Header';
import { Section } from '../../components/layout/Section';
import { MenuItem } from '../../components/ui/MenuItem';
import { Toggle } from '../../components/ui/Toggle';
import { colors, spacing } from '../../theme';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <Header
        title="Settings"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* PREFERENCES Section */}
        <Section title="PREFERENCES" style={styles.section}>
          <View style={styles.toggleItem}>
            <View style={styles.toggleItemContent}>
              <MenuItem
                icon="location"
                label="Location Services"
                subtitle="Find deals near you"
                onPress={() => { }}
                showBorder={false}
                style={styles.toggleMenuItem}
              />
            </View>
            <Toggle
              value={locationEnabled}
              onValueChange={setLocationEnabled}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleItem}>
            <View style={styles.toggleItemContent}>
              <MenuItem
                icon="moon"
                label="Dark Mode"
                subtitle="Coming soon"
                onPress={() => { }}
                showBorder={false}
                style={styles.toggleMenuItem}
              />
            </View>
            <Toggle
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              disabled={true}
            />
          </View>

          <View style={styles.divider} />

          <MenuItem
            icon="globe"
            label="Language"
            subtitle={i18n.language === 'ru' ? 'Russian' : i18n.language === 'uz' ? 'Uzbek' : 'English'}
            onPress={() => {
              Alert.alert('Select Language', 'Choose your preferred language', [
                { text: 'English', onPress: () => i18n.changeLanguage('en') },
                { text: 'Русский', onPress: () => i18n.changeLanguage('ru') },
                { text: 'O\'zbekcha', onPress: () => i18n.changeLanguage('uz') },
                { text: 'Cancel', style: 'cancel' }
              ])
            }}
            showBorder={false}
          />
        </Section>

        {/* SUPPORT Section */}
        <Section title="SUPPORT" style={styles.section}>
          <MenuItem
            icon="help-circle"
            label="Help Center"
            onPress={() => {/* TODO */ }}
          />
          <MenuItem
            icon="file-text"
            label="Terms of Service"
            onPress={() => {/* TODO */ }}
            showBorder={false}
          />
        </Section>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.card,
    marginTop: spacing.sm,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.lg,
  },
  toggleItemContent: {
    flex: 1,
  },
  toggleMenuItem: {
    paddingRight: 0,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: spacing.lg + 28 + spacing.md, // Icon width + margin
  },
  bottomSpacing: {
    height: spacing.xxxl,
  },
});

export default SettingsScreen;
