import React, { useEffect, useRef, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatCard } from '../../../src/components/StatCard';
import { RequestCard } from '../../../src/components/RequestCard';
import { SkeletonDashboard } from '../../../src/components/Skeleton';
import { useDashboardStats, useRequests } from '../../../src/hooks/useRequests';
import { useAppStore } from '../../../src/store/appStore';
import { formatLastSync, syncAll } from '../../../src/services/SyncService';
import { getEthiopianDateTime } from '../../../src/utils/ethiopianDate';
import { spacing, borderRadius, colors } from '../../../src/theme/colors';
import { useNetworkStatus } from '../../../src/hooks/useNetworkStatus';

// Live clock that ticks every second
function useClock() {
  const [now, setNow] = useState(() => new Date());
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(intervalRef.current);
  }, []);
  return now;
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const now = useClock();
  const lastSyncAt = useAppStore((s) => s.lastSyncAt);
  const syncStatus = useAppStore((s) => s.syncStatus);
  const { isConnected } = useNetworkStatus();
  const { data: requests, isLoading, refetch, isRefetching } = useRequests();
  const stats = useDashboardStats(requests);

  const eth = getEthiopianDateTime(now);

  const recentRequests = [...(requests ?? [])]
    .sort((a, b) => new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime())
    .slice(0, 5);

  const handleRefresh = () => { refetch(); syncAll(); };

  const isSyncing = syncStatus === 'syncing';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      {/* ── Minimal Header ── */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline + '25' }]}>
        {/* Left: date + time */}
        <View style={styles.headerLeft}>
          <Text variant="titleMedium" style={[styles.ethDate, { color: theme.colors.onSurface }]}>
            {eth.ethiopianDate}
          </Text>
          <Text variant="labelMedium" style={[styles.ethTime, { color: theme.colors.onSurfaceVariant }]}>
            {eth.ethiopianTime}
          </Text>
        </View>

        {/* Right: online dot + sync button */}
        <View style={styles.headerRight}>
          {/* Online / Offline indicator */}
          <View style={styles.connectionPill}>
            <View style={[styles.dot, { backgroundColor: isConnected ? colors.completed : colors.cancelled }]} />
            <Text variant="labelSmall" style={{ color: isConnected ? colors.completed : colors.cancelled, fontWeight: '600' }}>
              {isConnected ? t('common.online') : t('common.offline')}
            </Text>
          </View>

          {/* Sync button */}
          <Pressable
            onPress={handleRefresh}
            disabled={isSyncing}
            style={({ pressed }) => [
              styles.syncBtn,
              { backgroundColor: theme.colors.surfaceVariant, opacity: pressed || isSyncing ? 0.6 : 1 },
            ]}
          >
            <MaterialCommunityIcons
              name={isSyncing ? 'sync' : 'sync'}
              size={16}
              color={isSyncing ? colors.processing : theme.colors.onSurfaceVariant}
              style={isSyncing ? { transform: [{ rotate: '45deg' }] } : undefined}
            />
            <Text variant="labelSmall" style={{ color: isSyncing ? colors.processing : theme.colors.onSurfaceVariant, fontWeight: '600', fontSize: 11 }}>
              {isSyncing ? t('sync.syncing') : lastSyncAt ? formatLastSync(lastSyncAt, t) : t('dashboard.syncNow')}
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {isLoading && !requests ? (
          <SkeletonDashboard />
        ) : (
          <>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard title={t('dashboard.pending')} value={stats.pending} color={colors.pending} icon="clock-outline" />
              <StatCard title={t('dashboard.processing')} value={stats.processing} color={colors.processing} icon="progress-clock" />
              <StatCard title={t('dashboard.completedToday')} value={stats.completedToday} color={colors.completed} icon="check-circle-outline" />
              <StatCard title={t('dashboard.total')} value={stats.total} color={colors.cancelled} icon="format-list-bulleted" />
            </View>

            {/* Recent Requests */}
            {recentRequests.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.sectionRow}>
                  <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {t('dashboard.recentRequests')}
                  </Text>
                  <Pressable onPress={() => router.push('/receiver/(tabs)/requests' as any)}>
                    <Text variant="labelMedium" style={{ color: colors.primary, fontWeight: '600' }}>
                      {t('dashboard.viewAll')}
                    </Text>
                  </Pressable>
                </View>
                {recentRequests.map((req) => (
                  <RequestCard
                    key={req.requestId}
                    request={req}
                    onPress={() => router.push(`/receiver/request/${req.requestId}`)}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ethDate: {
    fontWeight: '700',
    fontSize: 15,
  },
  ethTime: {
    fontSize: 12,
    opacity: 0.8,
  },
  connectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  content: {
    padding: spacing.md,
    paddingBottom: 90,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  newRequestBtn: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  recentSection: {
    gap: 0,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
});