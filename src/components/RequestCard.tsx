import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { Request } from '../api/types';
import { formatPhoneDisplay } from '../utils/phone';
import { getStatusColor } from '../utils/requestHelpers';
import { useTranslation } from 'react-i18next';
import { spacing, borderRadius } from '../theme/colors';

interface RequestCardProps {
  request: Request;
  onPress: () => void;
}

const STATUS_EMOJI: Record<string, string> = {
  Pending: '🟡',
  Processing: '🔵',
  Completed: '🟢',
  Cancelled: '🔴',
};

export function RequestCard({ request, onPress }: RequestCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const statusKey = `requests.status${request.status}` as const;
  const statusColor = getStatusColor(request.status);
  const emoji = STATUS_EMOJI[request.status] ?? '';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline + '25',
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      {/* Left: phone, description, date */}
      <View style={styles.left}>
        <Text variant="titleSmall" style={[styles.phone, { color: theme.colors.onSurface }]}>
          {formatPhoneDisplay(request.buyerPhone)}
        </Text>
        {request.description ? (
          <Text
            variant="bodySmall"
            numberOfLines={1}
            style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
          >
            {request.description}
          </Text>
        ) : null}
        <Text variant="labelSmall" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          {request.createdDate} · {request.createdTime}
        </Text>
      </View>

      {/* Right: amount + status pill */}
      <View style={styles.right}>
        <Text variant="titleMedium" style={[styles.amount, { color: theme.colors.primary }]}>
          {request.amount}{' '}
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            ETB
          </Text>
        </Text>
        <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {emoji} {t(statusKey)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  left: {
    flex: 1,
    gap: 3,
  },
  phone: {
    fontWeight: '700',
  },
  description: {
    opacity: 0.8,
  },
  date: {
    opacity: 0.55,
    fontSize: 11,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  amount: {
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
