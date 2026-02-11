import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../localization/i18n';

import { Header } from '../../components/layout/Header';
import { Section } from '../../components/layout/Section';
import { MenuItem } from '../../components/ui/MenuItem';
import { Toggle } from '../../components/ui/Toggle';
import { colors, spacing } from '../../theme';

const LANGUAGE_LABELS: Record<string, string> = {
  uz: "O'zbekcha",
  en: 'English',
  ru: 'Русский',
};

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <View style={styles.container}>
      <Header
        title={t('settings.title')}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* PREFERENCES Section */}
        <Section title={t('settings.preferences')} style={styles.section}>
          <View style={styles.toggleItem}>
            <View style={styles.toggleItemContent}>
              <MenuItem
                icon="location"
                label={t('settings.location_services')}
                subtitle={t('settings.location_subtitle')}
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
                label={t('settings.dark_mode')}
                subtitle={t('settings.coming_soon')}
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
            label={t('settings.language')}
            subtitle={LANGUAGE_LABELS[i18n.language] || i18n.language}
            onPress={() => {
              Alert.alert(t('settings.select_language'), t('settings.choose_language'), [
                { text: 'English', onPress: () => changeLanguage('en') },
                { text: 'Русский', onPress: () => changeLanguage('ru') },
                { text: "O'zbekcha", onPress: () => changeLanguage('uz') },
                { text: t('common.cancel'), style: 'cancel' }
              ])
            }}
            showBorder={false}
          />
        </Section>

        {/* SUPPORT Section */}
        <Section title={t('settings.support')} style={styles.section}>
          <MenuItem
            icon="help-circle"
            label={t('settings.help_center')}
            onPress={() => {/* TODO */ }}
          />
          <MenuItem
            icon="file-text"
            label={t('settings.terms')}
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
