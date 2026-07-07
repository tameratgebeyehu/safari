import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Card, Chip, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { useRequests } from '../../src/hooks/useRequests';
import { getStatusColor } from '../../src/utils/requestHelpers';
import { colors, spacing, borderRadius } from '../../src/theme/colors';
import { formatPhoneDisplay } from '../../src/utils/phone';

export default function SenderHistoryScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: requests, isLoading, refetch, isRefetching } = useRequests();

  // Filter requests to show all sent voucher requests, sorted newest first
  const sortedRequests = React.useMemo(() => {
    if (!requests) return [];
    return [...requests].sort(
      (a, b) => new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime()
    );
  }, [requests]);

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'Pending': return '🟡';
      case 'Processing': return '🔵';
      case 'Completed': return '🟢';
      case 'Cancelled': return '🔴';
      default: return '';
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusColor = getStatusColor(item.status);
    const statusLabel = t(`requests.status${item.status}` as const);

    return (
      <Card style={styles.card} mode="outlined">
        <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
        <Card.Content style={styles.cardContent}>
          <View style={styles.row}>
            <Text variant="titleMedium" style={styles.phone}>
              🇪🇹 {formatPhoneDisplay(item.buyerPhone)}
            </Text>
            <Text variant="headlineSmall" style={[styles.amount, { color: theme.colors.primary }]}>
              {item.amount} ETB
            </Text>
          </View>
          
          <Text variant="bodySmall" style={[styles.time, { color: theme.colors.onSurfaceVariant }]}>
            {item.createdDate} · {item.createdTime}
          </Text>

          <View style={styles.bottomRow}>
            <Chip
              compact
              style={[styles.chip, { backgroundColor: statusColor + '22' }]}
              textStyle={{ color: statusColor, fontWeight: '700', fontSize: 13 }}
            >
              {`${getStatusEmoji(item.status)} ${statusLabel}`}
            </Chip>
            {item.pendingSync && (
              <Chip compact icon="cloud-upload-outline" style={styles.syncChip} textStyle={{ fontSize: 11 }}>
                {t('sender.savedOffline')}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.outline + '20' }]}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => router.back()}
          style={styles.backBtn}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          {t('sender.historyTitle')}
        </Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <FlatList
        data={sortedRequests}
        keyExtractor={(item) => item.requestId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('sender.historyEmpty')}
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    height: 56,
    borderBottomWidth: 1,
  },
  backBtn: { margin: 0 },
  headerTitle: { fontWeight: '700' },
  headerRightPlaceholder: { width: 48 }, // balances the back button for centered title
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  card: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  statusBar: { height: 4 },
  cardContent: { paddingVertical: spacing.sm },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  phone: { fontWeight: '700' },
  amount: { fontWeight: '800' },
  time: { marginBottom: spacing.sm, opacity: 0.8 },
  bottomRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: { alignSelf: 'flex-start' },
  syncChip: { alignSelf: 'flex-start', backgroundColor: '#E0E0E0' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
});
