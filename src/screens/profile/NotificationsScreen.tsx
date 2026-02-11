import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components/layout/Header';
import { NotificationCard, NotificationType } from '../../components/profile/NotificationCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors, spacing, typography } from '../../theme';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isUnread: boolean;
}

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Order Confirmed',
    description: 'Your order at Fresh Bake House has been confirmed. Pick up between 5:00 PM - 6:00 PM.',
    timestamp: '10 min ago',
    isUnread: true,
  },
  {
    id: '2',
    type: 'deal',
    title: 'New Deals Available',
    description: '5 new surprise bags available near you. Check them out before they\'re gone!',
    timestamp: '1 hour ago',
    isUnread: true,
  },
  {
    id: '3',
    type: 'confirmation',
    title: 'Order Completed',
    description: 'Thanks for saving food! You saved 2.5kg of CO2 and $12.00.',
    timestamp: 'Yesterday',
    isUnread: false,
  },
  {
    id: '4',
    type: 'seller',
    title: 'Seller Application',
    description: 'Your seller application has been approved! Start listing your products now.',
    timestamp: '2 days ago',
    isUnread: false,
  },
  {
    id: '5',
    type: 'order',
    title: 'Order Ready',
    description: 'Your order at Green Market is ready for pickup. Show your QR code at the counter.',
    timestamp: '3 days ago',
    isUnread: false,
  },
];

const NotificationsScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n =>
        n.id === notification.id ? { ...n, isUnread: false } : n
      )
    );

    // Navigate based on type
    switch (notification.type) {
      case 'order':
      case 'confirmation':
        // Navigate to order detail
        console.log('Navigate to order:', notification.id);
        break;
      case 'deal':
        // Navigate to discovery
        console.log('Navigate to deals');
        break;
      case 'seller':
        // Navigate to seller dashboard
        console.log('Navigate to seller dashboard');
        break;
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isUnread: false }))
    );
  };

  const renderRightAction = () => {
    if (unreadCount === 0) return null;

    return (
      <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllButton}>
        <Text style={styles.markAllText}>{t('notifications.mark_all_read')}</Text>
      </TouchableOpacity>
    );
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationCard
      id={item.id}
      type={item.type}
      title={item.title}
      description={item.description}
      timestamp={item.timestamp}
      isUnread={item.isUnread}
      onPress={() => handleNotificationPress(item)}
      onDelete={() => handleDeleteNotification(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <Header
        title={t('notifications.title')}
        showBack
        onBackPress={() => navigation.goBack()}
        rightAction={renderRightAction()}
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title={t('notifications.no_notifications')}
          subtitle={t('notifications.no_notifications_subtitle')}
        />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
  },
  markAllButton: {
    padding: spacing.sm,
  },
  markAllText: {
    ...typography.body,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default NotificationsScreen;
