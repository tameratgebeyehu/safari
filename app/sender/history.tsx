import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text, useTheme, Button, Dialog, Portal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRequests } from '../../src/hooks/useRequests';
import { getStatusColor } from '../../src/utils/requestHelpers';
import { colors, spacing, borderRadius } from '../../src/theme/colors';
import { formatPhoneDisplay } from '../../src/utils/phone';
import type { Request } from '../../src/api/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type StatusFilter = 'All' | 'Pending' | 'Processing' | 'Completed' | 'Cancelled';

const STATUS_ICONS: Record<string, string> = {
  Pending: 'clock-outline',
  Processing: 'progress-clock',
  Completed: 'check-circle',
  Cancelled: 'close-circle',
};

// ─── Grouping helpers ──────────────────────────────────────────────────────────

function getGroupKey(isoTimestamp: string): 'today' | 'yesterday' | 'thisWeek' | 'earlier' {
  const now = new Date();
  const d = new Date(isoTimestamp);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameDay) return 'today';
  if (diffDays < 2) return 'yesterday';
  if (diffDays < 7) return 'thisWeek';
  return 'earlier';
}

const GROUP_ORDER = ['today', 'yesterday', 'thisWeek', 'earlier'] as const;

// ─── Request Card ──────────────────────────────────────────────────────────────

function RequestItem({ item }: { item: Request }) {
  const theme = useTheme();
  const { t } = useTranslation();
  const statusColor = getStatusColor(item.status);
  const statusIcon = STATUS_ICONS[item.status] || 'help-circle-outline';

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {/* Color bar on left */}
      <View style={[styles.cardBar, { backgroundColor: statusColor }]} />

      <View style={styles.cardBody}>
        {/* Phone + Amount row */}
        <View style={styles.cardTopRow}>
          <View style={styles.phoneRow}>
            <MaterialCommunityIcons name="phone" size={18} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.cardPhone, { color: theme.colors.onSurface }]}>
              {formatPhoneDisplay(item.buyerPhone)}
            </Text>
          </View>
          <Text style={[styles.cardAmount, { color: theme.colors.primary }]}>
            {Number(item.amount).toLocaleString('en-ET')} {t('common.currency')}
          </Text>
        </View>

        {/* Description */}
        {!!item.description && (
          <View style={styles.descRow}>
            <MaterialCommunityIcons name="text-box-outline" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.cardDesc, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
              {item.description}
            </Text>
          </View>
        )}

        {/* Date + Time */}
        <View style={styles.dateRow}>
          <MaterialCommunityIcons name="calendar-clock" size={14} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.cardDate, { color: theme.colors.onSurfaceVariant }]}>
            {item.createdDate}  ·  {item.createdTime}
          </Text>
        </View>

        {/* Status badge row */}
        <View style={styles.cardBottomRow}>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '20' }]}>
            <MaterialCommunityIcons name={statusIcon as any} size={14} color={statusColor} />
            <Text style={[styles.statusPillText, { color: statusColor }]}>
              {t(`requests.status${item.status}`)}
            </Text>
          </View>

          {item.pendingSync && (
            <View style={[styles.syncPill, { backgroundColor: theme.colors.surfaceVariant }]}>
              <MaterialCommunityIcons name="cloud-upload-outline" size={13} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.syncPillText, { color: theme.colors.onSurfaceVariant }]}>
                {t('sender.savedOffline')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  const theme = useTheme();
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionLine, { backgroundColor: theme.colors.outlineVariant }]} />
      <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      <View style={[styles.sectionLine, { backgroundColor: theme.colors.outlineVariant }]} />
    </View>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="inbox-outline" size={72} color={theme.colors.outlineVariant} />
      <Text style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
        {t('sender.historyEmpty')}
      </Text>
      <Text style={[styles.emptySub, { color: theme.colors.outlineVariant }]}>
        {t('sender.historyEmptySub')}
      </Text>
    </View>
  );
}

// ─── Filter Row ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS: StatusFilter[] = ['All', 'Pending', 'Processing', 'Completed', 'Cancelled'];



// ─── Main Screen ───────────────────────────────────────────────────────────────

type ListItem =
  | { type: 'section'; key: string; label: string }
  | { type: 'request'; key: string; data: Request };

export default function SenderHistoryScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: requests, isLoading, refetch, isRefetching } = useRequests();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<StatusFilter>('All');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const groupLabels: Record<string, string> = {
    today: t('sender.today'),
    yesterday: t('sender.yesterday'),
    thisWeek: t('sender.thisWeek'),
    earlier: t('sender.earlier'),
  };

  // Build flat list with section headers
  const listData = useMemo<ListItem[]>(() => {
    if (!requests) return [];

    const q = searchQuery.trim().toLowerCase();

    const filtered = [...requests]
      .filter((r) => {
        if (filter !== 'All' && r.status !== filter) return false;
        if (q) {
          return (
            r.buyerPhone.includes(q) ||
            formatPhoneDisplay(r.buyerPhone).includes(q) ||
            (r.description && r.description.toLowerCase().includes(q))
          );
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime()
      );

    // Group
    const groups: Record<string, Request[]> = {};
    for (const r of filtered) {
      const key = getGroupKey(r.isoTimestamp);
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }

    const result: ListItem[] = [];
    for (const groupKey of GROUP_ORDER) {
      const items = groups[groupKey];
      if (!items || items.length === 0) continue;
      result.push({ type: 'section', key: `section-${groupKey}`, label: groupLabels[groupKey] });
      for (const item of items) {
        result.push({ type: 'request', key: item.requestId, data: item });
      }
    }
    return result;
  }, [requests, searchQuery, filter, t]);

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'section') return <SectionHeader label={item.label} />;
    return <RequestItem item={item.data} />;
  };

  const hasResults = listData.length > 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
        {searchOpen ? (
          <TextInput
            style={[styles.searchInput, { color: theme.colors.onSurface, borderColor: theme.colors.primary, marginLeft: 0 }]}
            placeholder={t('sender.historySearch')}
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        ) : (
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface, marginLeft: 4 }]}>
            {t('sender.historyTitle')}
          </Text>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {!searchOpen && (
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => setFilterDialogOpen(true)}
              accessibilityLabel={t('sender.historyFilter')}
            >
              <MaterialCommunityIcons
                name="filter-variant"
                size={22}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => {
              setSearchOpen((v) => !v);
              if (searchOpen) setSearchQuery('');
            }}
          >
            <MaterialCommunityIcons
              name={searchOpen ? 'close' : 'magnify'}
              size={22}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── List ── */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.list,
          !hasResults && styles.listEmpty,
        ]}
        ListEmptyComponent={!isLoading ? <EmptyState /> : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* ── Filter Dialog ── */}
      <Portal>
        <Dialog visible={filterDialogOpen} onDismiss={() => setFilterDialogOpen(false)} style={{ borderRadius: 28 }}>
          <Dialog.Title style={{ fontWeight: '700', fontSize: 20 }}>{t('sender.historyFilter')}</Dialog.Title>
          <Dialog.Content style={{ paddingHorizontal: 0 }}>
            {FILTER_OPTIONS.map((f) => {
              const active = f === filter;
              const statusColor = f === 'All' ? theme.colors.primary : getStatusColor(f);
              const labelMap: Record<StatusFilter, string> = {
                All: t('sender.historyAll'),
                Pending: t('requests.statusPending'),
                Processing: t('requests.statusProcessing'),
                Completed: t('requests.statusCompleted'),
                Cancelled: t('requests.statusCancelled'),
              };
              return (
                <TouchableOpacity
                  key={f}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                    backgroundColor: active ? theme.colors.surfaceVariant : 'transparent',
                  }}
                  onPress={() => {
                    setFilter(f);
                    setFilterDialogOpen(false);
                  }}
                >
                  {f !== 'All' ? (
                    <MaterialCommunityIcons
                      name={STATUS_ICONS[f] as any}
                      size={20}
                      color={statusColor}
                      style={{ marginRight: 14 }}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="filter-variant"
                      size={20}
                      color={theme.colors.primary}
                      style={{ marginRight: 14 }}
                    />
                  )}
                  <Text style={{ fontSize: 17, fontWeight: active ? '700' : '500', color: theme.colors.onSurface, flex: 1 }}>
                    {labelMap[f]}
                  </Text>
                  {active && (
                    <MaterialCommunityIcons name="check" size={22} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFilterDialogOpen(false)} labelStyle={{ fontWeight: '700', fontSize: 16 }}>
              {t('common.cancel')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800' },
  searchInput: {
    flex: 1,
    fontSize: 16,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    height: 40,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1.5,
  },
  filterChipText: { fontSize: 13, fontWeight: '700' },

  // List
  list: { padding: 16, paddingBottom: 48 },
  listEmpty: { flex: 1 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  sectionLine: { flex: 1, height: 1 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Card
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardBar: { width: 5 },
  cardBody: { flex: 1, padding: 16, gap: 6 },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardPhone: { fontSize: 18, fontWeight: '800' },
  cardAmount: { fontSize: 20, fontWeight: '800' },
  descRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDesc: { fontSize: 14, flex: 1 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDate: { fontSize: 13 },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusPillText: { fontSize: 13, fontWeight: '700' },
  syncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  syncPillText: { fontSize: 11, fontWeight: '600' },

  // Empty
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
});
