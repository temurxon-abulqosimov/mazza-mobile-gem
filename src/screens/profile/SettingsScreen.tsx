import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/layout/Header';
import { Section } from '../../components/layout/Section';
import { MenuItem } from '../../components/ui/MenuItem';
import { Toggle } from '../../components/ui/Toggle';
import { colors, spacing } from '../../theme';

const SettingsScreen = () => {
  const navigation = useNavigation();
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
                icon="📍"
                label="Location Services"
                subtitle="Find deals near you"
                onPress={() => {}}
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
                icon="🌙"
                label="Dark Mode"
                subtitle="Coming soon"
                onPress={() => {}}
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
            icon="🌐"
            label="Language"
            subtitle="English"
            onPress={() => {/* TODO: Language picker */}}
            showBorder={false}
          />
        </Section>

        {/* SUPPORT Section */}
        <Section title="SUPPORT" style={styles.section}>
          <MenuItem
            icon="❓"
            label="Help Center"
            onPress={() => {/* TODO */}}
          />
          <MenuItem
            icon="📄"
            label="Terms of Service"
            onPress={() => {/* TODO */}}
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
