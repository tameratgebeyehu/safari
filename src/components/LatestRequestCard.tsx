import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Card, Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import type { Request } from '../api/types';
import { getStatusColor } from '../utils/requestHelpers';
import { spacing, borderRadius } from '../theme/colors';

interface LatestRequestCardProps {
  request: Request;
}

export function LatestRequestCard({ request }: LatestRequestCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(1)).current;
  const badgeOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Card bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Badge smooth transition animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(badgeScale, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(badgeScale, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(badgeOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(badgeScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [request.status, scaleAnim, badgeScale, badgeOpacity]);

  const statusColor = getStatusColor(request.status);
  const statusLabel = t(`requests.status${request.status}` as const);

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'Pending': return '🟡';
      case 'Processing': return '🔵';
      case 'Completed': return '🟢';
      case 'Cancelled': return '🔴';
      default: return '';
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        {t('sender.latestRequest')}
      </Text>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Card style={styles.card} mode="outlined">
          <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
          <Card.Content style={styles.content}>
            <View style={styles.row}>
              <Text variant="titleMedium" style={styles.phone}>
                🇪🇹 {request.buyerPhone}
              </Text>
              <Text
                variant="headlineSmall"
                style={[styles.amount, { color: theme.colors.primary }]}
              >
                {request.amount}
              </Text>
            </View>

            <Text
              variant="bodySmall"
              style={[styles.time, { color: theme.colors.onSurfaceVariant }]}
            >
              {request.createdDate} · {request.createdTime}
            </Text>

            <Animated.View style={{ transform: [{ scale: badgeScale }], opacity: badgeOpacity, alignSelf: 'flex-start' }}>
              <Chip
                compact
                style={[styles.chip, { backgroundColor: statusColor + '22' }]}
                textStyle={{ color: statusColor, fontWeight: '700', fontSize: 13 }}
              >
                {`${getStatusEmoji(request.status)} ${statusLabel}`}
              </Chip>
            </Animated.View>
          </Card.Content>
        </Card>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  statusBar: {
    height: 4,
  },
  content: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  phone: {
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.sm,
  },
  amount: {
    fontWeight: '800',
  },
  time: {
    marginBottom: spacing.sm,
  },
  chip: {
    alignSelf: 'flex-start',
  },
});
