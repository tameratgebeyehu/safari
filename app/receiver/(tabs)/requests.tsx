import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Chip, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../../src/components/EmptyState';
import { RequestCard } from '../../../src/components/RequestCard';
import { SkeletonList } from '../../../src/components/Skeleton';
import { useRequests } from '../../../src/hooks/useRequests';
import { syncAll } from '../../../src/services/SyncService';
import { sortRequests } from '../../../src/utils/requestHelpers';
import type { RequestStatus } from '../../../src/constants';
import { spacing, colors } from '../../../src/theme/colors';

const STATUS_FILTERS: Array<{ key: RequestStatus | 'all'; color?: string }> = [
  { key: 'all' },
  { key: 'Pending', color: colors.pending },
  { key: 'Processing', color: colors.processing },
  { key: 'Completed', color: colors.completed },
  { key: 'Cancelled', color: colors.cancelled },
];

export default function RequestsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { data: requests, isLoading, error, refetch, isRefetching } = useRequests();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  const sorted = useMemo(() => {
    let items = sortRequests(requests ?? [], 'newest');
    if (statusFilter !== 'all') {
      items = items.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (r) =>
          r.buyerPhone.includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.requestId.toLowerCase().includes(q)
      );
    }
    return items;
  }, [requests, search, statusFilter]);

  if (isLoading && !requests) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Searchbar
          placeholder={t('requests.searchPlaceholder')}
          onChangeText={setSearch}
          value={search}
          style={[styles.search, { backgroundColor: theme.colors.surface }]}
        />
        <View style={styles.listPadding}>
          <SkeletonList count={6} />
        </View>
      </View>
    );
  }

  if (error && !requests) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge" style={{ color: theme.colors.error }}>
          {t('common.error')}
        </Text>
        <Text
          variant="bodyMedium"
          style={[styles.retryText, { color: theme.colors.primary }]}
          onPress={() => refetch()}
        >
          {t('common.retry')}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder={t('requests.searchPlaceholder')}
        onChangeText={setSearch}
        value={search}
        style={[styles.search, { backgroundColor: theme.colors.surface }]}
      />

      {/* Status Filter Chips */}
      <View style={styles.chipsRow}>
        {STATUS_FILTERS.map(({ key, color }) => (
          <Chip
            key={key}
            selected={statusFilter === key}
            onPress={() => setStatusFilter(key)}
            style={[
              styles.chip,
              statusFilter === key && { backgroundColor: (color ?? colors.primary) + '20' },
            ]}
            textStyle={
              statusFilter === key
                ? { color: color ?? colors.primary, fontWeight: '700' }
                : { color: theme.colors.onSurfaceVariant }
            }
            compact
          >
            {key === 'all' ? t('history.allStatuses') : t(`requests.status${key}`)}
          </Chip>
        ))}
      </View>

      {search || statusFilter !== 'all' ? (
        <Text variant="labelSmall" style={[styles.resultCount, { color: theme.colors.onSurfaceVariant }]}>
          {sorted.length} {t('history.results')}
        </Text>
      ) : null}

      <FlatList
        contentContainerStyle={styles.listPadding}
        data={sorted}
        keyExtractor={(item) => item.requestId}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onPress={() => router.push(`/receiver/request/${item.requestId}`)}
          />
        )}
        ListEmptyComponent={
          !isLoading ? <EmptyState message={t('requests.empty')} /> : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => { refetch(); syncAll(); }}
            colors={[colors.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  search: { margin: spacing.md, marginBottom: spacing.xs },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  chip: { borderRadius: 20 },
  resultCount: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    opacity: 0.7,
  },
  listPadding: { padding: spacing.md, flexGrow: 1, paddingBottom: spacing.xxl },
  retryText: { marginTop: spacing.sm, fontWeight: '600' },
});
