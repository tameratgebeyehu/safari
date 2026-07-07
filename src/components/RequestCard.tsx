import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Request } from '../api/types';
import { formatPhoneDisplay } from '../utils/phone';
import { getStatusColor } from '../utils/requestHelpers';
import { useTranslation } from 'react-i18next';
import { spacing, borderRadius } from '../theme/colors';

interface RequestCardProps {
  request: Request;
  onPress: () => void;
}

export function RequestCard({ request, onPress }: RequestCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const statusKey = `requests.status${request.status}` as const;
  const statusColor = getStatusColor(request.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outline + '30',
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      {/* Left color strip */}
      <View style={[styles.strip, { backgroundColor: statusColor }]} />

      <View style={styles.body}>
        {/* Top row: info + amount */}
        <View style={styles.topRow}>
          <View style={styles.info}>
            <View style={styles.phoneRow}>
              <MaterialCommunityIcons name="phone" size={14} color={theme.colors.onSurfaceVariant} />
              <Text variant="titleSmall" style={[styles.phone, { color: theme.colors.onSurface }]}>
                {formatPhoneDisplay(request.buyerPhone)}
              </Text>
            </View>
            {request.description ? (
              <Text
                variant="bodySmall"
                numberOfLines={1}
                style={[styles.description, { color: theme.colors.onSurfaceVariant }]}
              >
                {request.description}
              </Text>
            ) : null}
            <View style={styles.dateRow}>
              <MaterialCommunityIcons name="calendar-outline" size={12} color={theme.colors.onSurfaceVariant} />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 3, opacity: 0.7 }}>
                {request.createdDate} · {request.createdTime}
              </Text>
            </View>
          </View>

          <View style={styles.amountBlock}>
            <Text variant="titleLarge" style={[styles.amount, { color: theme.colors.primary }]}>
              {request.amount}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'right' }}>
              ETB
            </Text>
          </View>
        </View>

        {/* Bottom row: chips */}
        <View style={styles.chipRow}>
          <Chip
            compact
            style={[styles.chip, { backgroundColor: statusColor + '18' }]}
            textStyle={{ color: statusColor, fontSize: 11, fontWeight: '700' }}
          >
            {t(statusKey)}
          </Chip>
          {request.pendingSync ? (
            <Chip compact icon="cloud-upload-outline" style={styles.syncChip} textStyle={{ fontSize: 10 }}>
              Pending sync
            </Chip>
          ) : null}
        </View>

        {/* Request ID */}
        <Text variant="labelSmall" style={[styles.requestId, { color: theme.colors.onSurfaceVariant }]}>
          {request.requestId}
        </Text>
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
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  strip: {
    width: 4,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
    marginRight: spacing.sm,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  phone: {
    fontWeight: '700',
  },
  description: {
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '800',
    lineHeight: 30,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  syncChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  requestId: {
    marginTop: spacing.sm,
    opacity: 0.35,
    fontFamily: 'monospace',
    fontSize: 10,
  },
});
