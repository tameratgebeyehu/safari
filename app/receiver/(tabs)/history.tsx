import React, { useLayoutEffect, useMemo, useState } from 'react';
import { RefreshControl, SectionList, StyleSheet, View, Pressable, TextInput as RNTextInput } from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useRouter, useNavigation } from 'expo-router';
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
import { spacing, colors, borderRadius } from '../../../src/theme/colors';

const STATUS_FILTERS: Array<{ key: RequestStatus | 'all'; color?: string }> = [
  { key: 'all' },
  { key: 'Pending', color: colors.pending },
  { key: 'Processing', color: colors.processing },
  { key: 'Completed', color: colors.completed },
  { key: 'Cancelled', color: colors.cancelled },
];

const SORT_OPTIONS = [
  { key: 'newest' as const, labelKey: 'history.newest' },
  { key: 'oldest' as const, labelKey: 'history.oldest' },
  { key: 'highestAmount' as const, labelKey: 'history.highestAmount' },
  { key: 'lowestAmount' as const, labelKey: 'history.lowestAmount' },
];

export default function HistoryScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const { data: requests, isLoading, refetch, isRefetching } = useRequests();

  const [searchVisible, setSearchVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<typeof SORT_OPTIONS[number]['key']>('newest');

  // Header: Search icon + Filter icon
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8, gap: 4 }}>
          <Pressable
            onPress={() => { setFilterVisible((v) => !v); }}
            style={{ padding: 6 }}
          >
            <MaterialCommunityIcons
              name={filterVisible ? 'filter-off' : 'filter-variant'}
              size={22}
              color={filterVisible ? colors.primary : theme.colors.onSurface}
            />
          </Pressable>
          <Pressable
            onPress={() => { setSearchVisible((v) => !v); setSearch(''); }}
            style={{ padding: 6 }}
          >
            <MaterialCommunityIcons
              name={searchVisible ? 'close' : 'magnify'}
              size={22}
              color={searchVisible ? colors.primary : theme.colors.onSurface}
            />
          </Pressable>
        </View>
      ),
    });
  }, [navigation, searchVisible, filterVisible, theme.colors.onSurface]);

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
        data: grouped[key] as Request[],
      }));

    return { sections: sects, totalCount: items.length };
  }, [requests, search, statusFilter, sortBy, t]);

  const handleRefresh = () => { refetch(); };

  if (isLoading && !requests) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.listPadding}>
          <SkeletonList count={6} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search bar — only shown when toggled */}
      {searchVisible && (
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline + '30' }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.onSurfaceVariant} />
          <RNTextInput
            placeholder={t('common.search')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={search}
            onChangeText={setSearch}
            autoFocus
            style={[styles.searchInput, { color: theme.colors.onSurface }]}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          )}
        </View>
      )}

      {/* Filter panel — only shown when toggled */}
      {filterVisible && (
        <View style={[styles.filterPanel, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline + '25' }]}>
          {/* Status filters */}
          <Text variant="labelSmall" style={[styles.filterSectionLabel, { color: theme.colors.onSurfaceVariant }]}>
            {t('history.filterStatus')}
          </Text>
          <View style={styles.chipsRow}>
            {STATUS_FILTERS.map(({ key, color }) => (
              <Chip
                key={key}
                selected={statusFilter === key}
                onPress={() => setStatusFilter(key)}
                style={[
                  styles.chip,
                  { backgroundColor: statusFilter === key ? (color ?? colors.primary) + '18' : theme.colors.surfaceVariant },
                ]}
                textStyle={
                  statusFilter === key
                    ? { color: color ?? colors.primary, fontWeight: '700', fontSize: 12 }
                    : { color: theme.colors.onSurfaceVariant, fontSize: 12 }
                }
                compact
              >
                {key === 'all' ? t('history.allStatuses') : t(`requests.status${key}`)}
              </Chip>
            ))}
          </View>

          {/* Sort options */}
          <Text variant="labelSmall" style={[styles.filterSectionLabel, { color: theme.colors.onSurfaceVariant, marginTop: spacing.sm }]}>
            {t('history.sortBy')}
          </Text>
          <View style={styles.chipsRow}>
            {SORT_OPTIONS.map(({ key, labelKey }) => (
              <Chip
                key={key}
                selected={sortBy === key}
                onPress={() => setSortBy(key)}
                style={[
                  styles.chip,
                  { backgroundColor: sortBy === key ? colors.processing + '18' : theme.colors.surfaceVariant },
                ]}
                textStyle={
                  sortBy === key
                    ? { color: colors.processing, fontWeight: '700', fontSize: 12 }
                    : { color: theme.colors.onSurfaceVariant, fontSize: 12 }
                }
                compact
              >
                {t(labelKey)}
              </Chip>
            ))}
          </View>
        </View>
      )}

      {/* Active filters summary bar */}
      {(search || statusFilter !== 'all') && (
        <View style={styles.resultRow}>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {totalCount} {t('history.results')}
          </Text>
          {statusFilter !== 'all' && (
            <Pressable onPress={() => setStatusFilter('all')}>
              <Text variant="labelSmall" style={{ color: colors.primary, fontWeight: '600' }}>
                {t('common.clear')}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.requestId}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={!isLoading ? <EmptyState message={t('history.empty')} /> : null}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeaderRow, { backgroundColor: theme.colors.background }]}>
            <Text variant="labelMedium" style={[styles.sectionHeader, { color: theme.colors.onSurfaceVariant }]}>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterPanel: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  filterSectionLabel: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: { borderRadius: 20 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  listPadding: { padding: spacing.md, flexGrow: 1, paddingBottom: 90 },
  sectionHeaderRow: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
    marginBottom: 4,
  },
  sectionHeader: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
});
