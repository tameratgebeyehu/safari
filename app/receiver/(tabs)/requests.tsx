import React, { useLayoutEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Pressable, TextInput as RNTextInput } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Chip, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '../../../src/components/EmptyState';
import { RequestCard } from '../../../src/components/RequestCard';
import { SkeletonList } from '../../../src/components/Skeleton';
import { useRequests } from '../../../src/hooks/useRequests';
import { syncAll } from '../../../src/services/SyncService';
import { sortRequests } from '../../../src/utils/requestHelpers';
import type { RequestStatus } from '../../../src/constants';
import { spacing, colors, borderRadius } from '../../../src/theme/colors';

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
  const navigation = useNavigation();
  const { data: requests, isLoading, error, refetch, isRefetching } = useRequests();

  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  // Put search icon in the header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => { setSearchVisible((v) => !v); setSearch(''); }}
          style={{ marginRight: 12, padding: 4 }}
        >
          <MaterialCommunityIcons
            name={searchVisible ? 'close' : 'magnify'}
            size={22}
            color={theme.colors.onSurface}
          />
        </Pressable>
      ),
    });
  }, [navigation, searchVisible, theme.colors.onSurface]);

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
        <View style={styles.listPadding}>
          <SkeletonList count={6} />
        </View>
      </View>
    );
  }

  if (error && !requests) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge" style={{ color: theme.colors.error }}>{t('common.error')}</Text>
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
      {/* Search bar — only shown when toggled */}
      {searchVisible && (
        <View style={[styles.searchContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outline + '30' }]}>
          <MaterialCommunityIcons name="magnify" size={18} color={theme.colors.onSurfaceVariant} />
          <RNTextInput
            placeholder={t('requests.searchPlaceholder')}
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

      {/* Status Filter Chips */}
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

      {(search || statusFilter !== 'all') ? (
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
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chip: { borderRadius: 20 },
  resultCount: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
    opacity: 0.7,
  },
  listPadding: { padding: spacing.md, flexGrow: 1, paddingBottom: 90 },
  retryText: { marginTop: spacing.sm, fontWeight: '600' },
});
