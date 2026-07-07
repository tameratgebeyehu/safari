import React, { useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';
import { Chip, Searchbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '../../../src/components/EmptyState';
import { RequestCard } from '../../../src/components/RequestCard';
import { SkeletonList } from '../../../src/components/Skeleton';
import { useRequests } from '../../../src/hooks/useRequests';
import type { Request } from '../../../src/api/types';
import type { RequestStatus } from '../../../src/constants';
import {
  filterByStatus,
  groupByHistory,
  searchRequests,
  sortRequests,
} from '../../../src/utils/requestHelpers';
import { spacing, colors } from '../../../src/theme/colors';

const STATUS_FILTERS: Array<{ key: RequestStatus | 'all'; color?: string }> = [
  { key: 'all' },
  { key: 'Pending', color: colors.pending },
  { key: 'Processing', color: colors.processing },
  { key: 'Completed', color: colors.completed },
  { key: 'Cancelled', color: colors.cancelled },
];

const SORT_OPTIONS = [
  { key: 'newest' as const, icon: 'sort-calendar-descending' },
  { key: 'oldest' as const, icon: 'sort-calendar-ascending' },
  { key: 'highestAmount' as const, icon: 'sort-numeric-descending' },
  { key: 'lowestAmount' as const, icon: 'sort-numeric-ascending' },
];

export default function HistoryScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { data: requests, isLoading, refetch, isRefetching } = useRequests();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]['key']>('newest');

  const { sections, totalCount } = useMemo(() => {
    let items: Request[] = requests ?? [];
    items = searchRequests(items, search);
    items = filterByStatus(items, statusFilter);
    items = sortRequests(items, sortBy);

    const grouped = groupByHistory(items);
    const groupKeys = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'older'] as const;

    const sects = groupKeys
      .filter((key) => grouped[key].length > 0)
      .map((key) => ({
        title: t(`history.${key}`),
        icon: key === 'today' ? 'calendar-today' : 'calendar-blank',
        data: grouped[key] as Request[],
      }));

    return { sections: sects, totalCount: items.length };
  }, [requests, search, statusFilter, sortBy, t]);

  const handleRefresh = () => { refetch(); };

  if (isLoading && !requests) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Searchbar
          placeholder={t('common.search')}
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search */}
      <Searchbar
        placeholder={t('common.search')}
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

      {/* Sort Options */}
      <View style={styles.chipsRow}>
        {SORT_OPTIONS.map(({ key, icon }) => (
          <Chip
            key={key}
            selected={sortBy === key}
            onPress={() => setSortBy(key)}
            style={[
              styles.chip,
              sortBy === key && { backgroundColor: colors.processing + '20' },
            ]}
            textStyle={
              sortBy === key
                ? { color: colors.processing, fontWeight: '700' }
                : { color: theme.colors.onSurfaceVariant }
            }
            icon={icon as any}
            compact
          >
            {t(`history.${key}`)}
          </Chip>
        ))}
      </View>

      {/* Result count */}
      {(search || statusFilter !== 'all') && (
        <Text variant="labelSmall" style={[styles.resultCount, { color: theme.colors.onSurfaceVariant }]}>
          {totalCount} {t('history.results')}
        </Text>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.requestId}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={!isLoading ? <EmptyState message={t('history.empty')} /> : null}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        renderSectionHeader={({ section: { title, icon } }) => (
          <View style={[styles.sectionHeaderRow, { backgroundColor: theme.colors.background }]}>
            <MaterialCommunityIcons name={icon as any} size={14} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleSmall" style={[styles.sectionHeader, { color: theme.colors.onSurface }]}>
              {title}
            </Text>
          </View>
        )}
        renderItem={({ item }: { item: Request }) => (
          <RequestCard
            request={item}
            onPress={() => router.push(`/receiver/request/${item.requestId}`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  sectionHeader: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
