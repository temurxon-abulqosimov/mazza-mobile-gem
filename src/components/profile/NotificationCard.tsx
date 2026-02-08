import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';
import Icon from '../ui/Icon';
import { IconName } from '../../theme/icons';

export type NotificationType = 'order' | 'deal' | 'confirmation' | 'seller';

interface NotificationCardProps {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isUnread?: boolean;
  onPress: () => void;
  onDelete?: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  type,
  title,
  description,
  timestamp,
  isUnread = false,
  onPress,
  onDelete,
}) => {
  const getIconAndColor = (): { icon: IconName; bgColor: string; iconColor: string } => {
    switch (type) {
      case 'order':
        return { icon: 'package', bgColor: colors.infoBackground, iconColor: colors.info };
      case 'deal':
        return { icon: 'tag', bgColor: colors.primaryBackground, iconColor: colors.primary };
      case 'confirmation':
        return { icon: 'check-circle', bgColor: colors.successBackground, iconColor: colors.success };
      case 'seller':
        return { icon: 'store', bgColor: colors.secondaryBackground, iconColor: colors.secondary };
      default:
        return { icon: 'notification', bgColor: colors.backgroundDark, iconColor: colors.text.secondary };
    }
  };

  const { icon, bgColor, iconColor } = getIconAndColor();

  return (
    <TouchableOpacity
      style={[styles.container, isUnread && styles.unread]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Icon Circle */}
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Icon name={icon} size={24} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {isUnread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <Text style={styles.timestamp}>{timestamp}</Text>
      </View>

      {/* Delete Button */}
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="trash" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  unread: {
    backgroundColor: colors.backgroundLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h4,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  description: {
    ...typography.body,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  timestamp: {
    ...typography.caption,
    fontSize: 11,
    color: colors.text.tertiary,
  },
  deleteButton: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
});

export default NotificationCard;
