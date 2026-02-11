import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../state/authStore';
import { ProfileStackParamList } from '../../navigation/ProfileNavigator';
import { MainTabParamList } from '../../navigation/MainAppNavigator';
import { UserRole } from '../../domain/enums/UserRole';
import { MenuItem } from '../../components/ui/MenuItem';
import { Section } from '../../components/layout/Section';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { colors, spacing, typography } from '../../theme';
import Icon from '../../components/ui/Icon';
import { IconName } from '../../theme/icons';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { useTranslation } from 'react-i18next';

type ProfileNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ProfileHome'>,
  BottomTabNavigationProp<MainTabParamList>
>;

const ProfileScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<ProfileNavigationProp>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;

  const { userProfile, isLoading, isError, refetch } = useUserProfile();
  const { logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(t('auth.sign_out'), t('auth.sign_out_confirm'), [
      { text: t('common.cancel'), style: "cancel" },
      { text: t('auth.sign_out'), onPress: () => logout(), style: "destructive" }
    ]);
  };

  // Guest State View
  if (!isAuthenticated) {
    return <GuestProfileView />;
  }

  if (isLoading) {
    return <LoadingScreen message={t('profile.loading')} />;
  }

  if (isError || !userProfile) {
    return (
      <EmptyState
        icon="alert-circle"
        title={t('profile.could_not_load')}
        subtitle={t('profile.check_connection')}
        action={{
          label: t('common.retry'),
          onPress: () => refetch(),
        }}
      />
    );
  }

  const canBecomeSeller = userProfile.role === UserRole.CONSUMER;
  const isSeller = userProfile.role === UserRole.SELLER;

  return (
    <SafeAreaWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* User Header */}
        <View style={styles.header}>
          <Image
            source={{ uri: userProfile.avatarUrl || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <Text style={styles.fullName}>{userProfile.fullName}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>
          <Text style={styles.memberSince}>
            {t('profile.member_since', { date: new Date(userProfile.memberSince).toLocaleDateString() })}
          </Text>
          {isSeller && (
            <View style={styles.sellerBadgeContainer}>
              <Icon name="store" size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.sellerBadgeText}>{t('profile.seller_badge')}</Text>
            </View>
          )}
        </View>

        {/* Gamification Section */}
        <View style={styles.gamificationSection}>
          <Text style={styles.levelName}>{userProfile.level.name} {t('profile.food_saver')}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${userProfile.level.progress}%` }]} />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <StatCard label="Meals Saved" value={userProfile.stats.mealsSaved} />
          <StatCard label="CO2 (kg)" value={userProfile.stats.co2Prevented.toFixed(1)} />
          <StatCard label="Saved" value={`$${userProfile.stats.moneySaved.toFixed(0)}`} />
        </View>

        {/* HISTORY Section */}
        <Section title="HISTORY" style={styles.section}>
          <MenuItem
            icon="heart"
            label={t('profile.saved_deals')}
            subtitle={t('profile.saved_deals_subtitle')}
            onPress={() => navigation.navigate('Favorites' as never)}
          />
          <MenuItem
            icon="star"
            label={t('profile.followed_stores')}
            subtitle={t('profile.followed_stores_subtitle')}
            onPress={() => navigation.navigate('FollowedStores')}
          />
          <MenuItem
            icon="notification"
            label={t('profile.notifications')}
            subtitle={t('profile.notifications_subtitle')}
            onPress={() => navigation.navigate('Notifications')}
            badge={2}
          />
        </Section>

        {/* SELLER Section */}
        <Section title="SELLER" style={styles.section}>
          {canBecomeSeller ? (
            <MenuItem
              icon="store"
              label={t('profile.become_seller')}
              subtitle={t('profile.become_seller_subtitle')}
              onPress={() => navigation.navigate('BecomeSeller')}
              showBorder={false}
            />
          ) : isSeller ? (
            <>
              <MenuItem
                icon="dashboard"
                label={t('profile.dashboard_analytics')}
                onPress={() => navigation.navigate('SellerDashboard' as never)}
              />
              <MenuItem
                icon="package"
                label={t('profile.manage_products')}
                onPress={() => navigation.navigate('ManageProducts' as never)}
              />
              <MenuItem
                icon="orders"
                label={t('profile.view_orders')}
                onPress={() => navigation.navigate('SellerOrders' as never)}
              />
              <MenuItem
                icon="settings"
                label={t('profile.store_settings')}
                onPress={() => navigation.navigate('StoreSettings' as never)}
                showBorder={false}
              />
            </>
          ) : null}
        </Section>

        {/* SETTINGS Section */}
        <Section title="SETTINGS" style={styles.section}>
          <MenuItem
            icon="settings"
            label={t('profile.settings')}
            subtitle={t('profile.settings_subtitle')}
            onPress={() => navigation.navigate('Settings')}
          />
          <MenuItem
            icon="help-circle"
            label={t('profile.help_support')}
            subtitle={t('profile.help_subtitle')}
            onPress={() => {/* TODO: Navigate to help */ }}
            showBorder={false}
          />
        </Section>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Icon name="log-out" size={20} color={colors.error} style={styles.signOutIcon} />
            <Text style={styles.signOutText}>{t('auth.sign_out')}</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaWrapper>
  );
};

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/**
 * Guest Profile View
 * Shown when user is not authenticated
 */
function GuestProfileView() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.guestContent}>
      {/* Hero Section */}
      <View style={styles.guestHero}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400' }}
          style={styles.guestHeroImage}
        />
        <View style={styles.guestHeroOverlay}>
          <Text style={styles.guestHeroText}>{t('profile.guest_hero')}</Text>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.guestCTA}>
        <Text style={styles.guestTitle}>{t('profile.guest_cta_title')}</Text>
        <Text style={styles.guestSubtitle}>
          {t('profile.guest_cta_subtitle')}
        </Text>

        <Button
          title={t('auth.create_account')}
          onPress={() => navigation.navigate('Register')}
          fullWidth
          style={styles.createAccountButton}
        />

        <Button
          title={t('auth.login')}
          onPress={() => navigation.navigate('Login')}
          variant="secondary"
          fullWidth
          style={styles.loginButton}
        />
      </View>

      {/* About Mazza Section */}
      <Section title={t('profile.about_mazza')} style={styles.guestAboutSection}>
        <MenuItem
          icon="info"
          label={t('profile.how_it_works')}
          onPress={() => {/* TODO */ }}
        />
        <MenuItem
          icon="message-circle"
          label={t('profile.support')}
          onPress={() => {/* TODO */ }}
          showBorder={false}
        />
      </Section>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.md,
  },
  fullName: {
    ...typography.h2,
    color: colors.text.primary,
  },
  email: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  memberSince: {
    ...typography.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  sellerBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryBackground,
    borderRadius: spacing.radiusMd,
  },
  sellerBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
  },
  gamificationSection: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  levelName: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  progressBarContainer: {
    height: 20,
    width: '80%',
    backgroundColor: colors.backgroundDark,
    borderRadius: spacing.radiusLg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: spacing.radiusLg,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    backgroundColor: colors.card,
    marginTop: spacing.sm,
  },
  statCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: spacing.radiusLg,
    alignItems: 'center',
    width: '30%',
  },
  statValue: {
    ...typography.h2,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.card,
    marginTop: spacing.sm,
  },
  signOutSection: {
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  signOutButton: {
    backgroundColor: colors.card,
    paddingVertical: spacing.lg,
    borderRadius: spacing.radiusSm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.error,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signOutIcon: {
    marginRight: spacing.sm,
  },
  signOutText: {
    color: colors.error,
    ...typography.button,
  },
  bottomSpacing: {
    height: spacing.xxxl,
  },

  // Guest Profile Styles
  guestContent: {
    flexGrow: 1,
  },
  guestHero: {
    height: 300,
    position: 'relative',
  },
  guestHeroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  guestHeroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  guestHeroText: {
    color: colors.text.inverse,
    ...typography.h2,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  guestCTA: {
    backgroundColor: colors.card,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  guestTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  guestSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  createAccountButton: {
    marginBottom: spacing.md,
  },
  loginButton: {
    marginBottom: 0,
  },
  guestAboutSection: {
    backgroundColor: colors.card,
    marginTop: spacing.xl,
  },
});

export default ProfileScreen;
