import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { Card, Text, useTheme, Button, Portal, Dialog, TextInput, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatCard } from '../../../src/components/StatCard';
import { RequestCard } from '../../../src/components/RequestCard';
import { ConnectionIndicator } from '../../../src/components/ConnectionIndicator';
import { SkeletonDashboard } from '../../../src/components/Skeleton';
import { useDashboardStats, useRequests, useCreateRequest } from '../../../src/hooks/useRequests';
import { useAppStore } from '../../../src/store/appStore';
import { formatLastSync, syncAll } from '../../../src/services/SyncService';
import { getEthiopianDateTime } from '../../../src/utils/ethiopianDate';
import { isValidEthiopianPhone, normalizePhoneNumber } from '../../../src/utils/phone';
import { generateRequestId } from '../../../src/utils/requestId';
import { spacing, borderRadius, colors } from '../../../src/theme/colors';

function useTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

function getGreeting(h: number): string {
  if (h < 12) return 'dashboard.greetingMorning';
  if (h < 17) return 'dashboard.greetingAfternoon';
  return 'dashboard.greetingEvening';
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const now = useTime();
  const lastSyncAt = useAppStore((s) => s.lastSyncAt);
  const syncStatus = useAppStore((s) => s.syncStatus);
  const { data: requests, isLoading, refetch, isRefetching } = useRequests();
  const stats = useDashboardStats(requests);
  const ethDate = getEthiopianDateTime().ethiopianDate;
  const greetingKey = getGreeting(now.getHours());

  const [newRequestModalVisible, setNewRequestModalVisible] = useState(false);
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [amountError, setAmountError] = useState('');
  const [snackbar, setSnackbar] = useState('');

  const createRequest = useCreateRequest();

  const handleCreateRequest = async () => {
    let valid = true;
    if (!isValidEthiopianPhone(phone)) {
      setPhoneError(t('sender.phoneError'));
      valid = false;
    } else {
      setPhoneError('');
    }

    const amountNum = parseInt(amount, 10);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setAmountError(t('sender.amountError'));
      valid = false;
    } else {
      setAmountError('');
    }

    if (!valid) return;

    const ethDateTime = getEthiopianDateTime();
    const payload = {
      requestId: generateRequestId(),
      buyerPhone: normalizePhoneNumber(phone),
      amount: amountNum,
      description: description.trim(),
      createdDate: ethDateTime.ethiopianDate,
      createdTime: ethDateTime.ethiopianTime,
      isoTimestamp: ethDateTime.isoTimestamp,
      userMode: 'receiver',
    };

    try {
      await createRequest.mutateAsync(payload);
      setSnackbar(t('sender.success'));
      setPhone('');
      setAmount('');
      setDescription('');
      setNewRequestModalVisible(false);
      refetch();
    } catch {
      setSnackbar(t('common.error'));
    }
  };

  const recentRequests = [...(requests ?? [])]
    .sort((a, b) => new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime())
    .slice(0, 3);

  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const quickActions = [
    {
      icon: 'plus',
      label: t('dashboard.actionNewRequest'),
      onPress: () => setNewRequestModalVisible(true),
      color: colors.success,
    },
    {
      icon: 'history',
      label: t('history.title'),
      onPress: () => router.push('/receiver/(tabs)/history' as any),
      color: colors.processing,
    },
    {
      icon: 'star',
      label: t('favorites.title'),
      onPress: () => router.push('/receiver/(tabs)/favorites' as any),
      color: '#F59E0B',
    },
    {
      icon: 'magnify',
      label: t('dashboard.actionSearch'),
      onPress: () => router.push('/receiver/(tabs)/requests' as any),
      color: colors.processing,
    },
    {
      icon: 'cog',
      label: t('settings.title'),
      onPress: () => router.push('/receiver/(tabs)/settings' as any),
      color: colors.cancelled,
    },
  ] as const;

  const handleRefresh = () => {
    refetch();
    syncAll();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} colors={[colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, fontWeight: '500' }}>
                {t(greetingKey)}
              </Text>
              <Text variant="headlineSmall" style={[styles.greeting, { color: theme.colors.onSurface }]}>
                {t('dashboard.title')}
              </Text>
              <View style={styles.headerMeta}>
                <MaterialCommunityIcons name="calendar" size={14} color={theme.colors.onSurfaceVariant} />
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                  {ethDate}
                </Text>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginHorizontal: 4 }}>
                  ·
                </Text>
                <MaterialCommunityIcons name="clock-outline" size={14} color={theme.colors.onSurfaceVariant} />
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                  {timeStr}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <ConnectionIndicator />
              {syncStatus === 'syncing' ? (
                <View style={styles.syncRow}>
                  <MaterialCommunityIcons name="sync" size={12} color={colors.processing} />
                  <Text variant="labelSmall" style={{ color: colors.processing, marginLeft: 3, fontSize: 10, fontWeight: '600' }}>
                    {t('sync.syncing')}
                  </Text>
                </View>
              ) : (
                <View style={styles.syncRow}>
                  <MaterialCommunityIcons
                    name={syncStatus === 'error' ? 'alert-circle-outline' : 'cloud-check'}
                    size={12}
                    color={syncStatus === 'error' ? colors.accent : colors.completed}
                  />
                  <Text
                    variant="labelSmall"
                    style={{
                      color: syncStatus === 'error' ? colors.accent : theme.colors.onSurfaceVariant,
                      marginLeft: 3,
                      fontSize: 10,
                      fontWeight: '600',
                    }}
                  >
                    {lastSyncAt ? formatLastSync(lastSyncAt, t) : t('dashboard.neverSynced')}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

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

            {/* Quick Actions */}
            <Text variant="titleSmall" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('dashboard.quickActions')}
            </Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, idx) => (
                <Pressable
                  key={action.label}
                  onPress={action.onPress}
                  style={({ pressed }) => [
                    styles.quickActionCard,
                    idx === 0 ? { width: '100%' } : { width: '48%' },
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline + '40' },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: action.color + '18' }]}>
                    <MaterialCommunityIcons name={action.icon} size={22} color={action.color} />
                  </View>
                  <Text variant="labelMedium" style={[styles.quickActionLabel, { color: theme.colors.onSurface }]}>
                    {action.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Sync Card */}
            <Card style={styles.syncCard} mode="outlined">
              <Card.Content style={styles.syncContent}>
                <View style={styles.syncInfo}>
                  <MaterialCommunityIcons
                    name={lastSyncAt ? 'cloud-check' : 'cloud-alert'}
                    size={20}
                    color={lastSyncAt ? colors.completed : colors.cancelled}
                  />
                  <View style={{ marginLeft: spacing.sm }}>
                    <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {t('dashboard.lastSync')}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurface }}>
                      {lastSyncAt ? formatLastSync(lastSyncAt, t) : t('dashboard.neverSynced')}
                    </Text>
                  </View>
                </View>
                <Button mode="text" compact icon="sync" onPress={handleRefresh}>
                  {t('dashboard.syncNow')}
                </Button>
              </Card.Content>
            </Card>

            {/* Recent Requests */}
            {recentRequests.length > 0 ? (
              <View style={styles.recentSection}>
                <View style={styles.sectionHeader}>
                  <Text variant="titleSmall" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
                    {t('dashboard.recentRequests')}
                  </Text>
                  <Button
                    mode="text"
                    compact
                    onPress={() => router.push('/receiver/(tabs)/requests' as any)}
                    labelStyle={{ fontSize: 13 }}
                  >
                    {t('dashboard.viewAll')}
                  </Button>
                </View>
                {recentRequests.map((req) => (
                  <RequestCard
                    key={req.requestId}
                    request={req}
                    onPress={() => router.push(`/receiver/request/${req.requestId}`)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  {t('requests.empty')}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Portal Dialog for Create Request */}
      <Portal>
        <Dialog visible={newRequestModalVisible} onDismiss={() => setNewRequestModalVisible(false)}>
          <Dialog.Title>{t('requests.newRequestTitle')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('sender.phoneLabel')}
              placeholder="09XX XXX XXXX"
              value={phone}
              onChangeText={(text) => {
                setPhone(text.replace(/[^\d+]/g, ''));
                if (phoneError) setPhoneError('');
              }}
              keyboardType="phone-pad"
              mode="outlined"
              error={!!phoneError}
              style={{ marginBottom: spacing.xs }}
            />
            {phoneError ? <Text style={{ color: colors.accent, marginBottom: spacing.sm, fontSize: 12 }}>{phoneError}</Text> : null}

            <TextInput
              label={t('sender.amountLabel')}
              value={amount}
              onChangeText={(text) => {
                setAmount(text.replace(/\D/g, ''));
                if (amountError) setAmountError('');
              }}
              keyboardType="number-pad"
              mode="outlined"
              error={!!amountError}
              style={{ marginBottom: spacing.xs }}
              right={<TextInput.Affix text="ETB" />}
            />
            {amountError ? <Text style={{ color: colors.accent, marginBottom: spacing.sm, fontSize: 12 }}>{amountError}</Text> : null}

            <TextInput
              label={t('sender.descriptionLabel')}
              placeholder={t('sender.descriptionPlaceholder')}
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              maxLength={100}
              style={{ marginBottom: spacing.sm }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setNewRequestModalVisible(false)}>{t('common.cancel')}</Button>
            <Button
              mode="contained"
              onPress={handleCreateRequest}
              loading={createRequest.isPending}
            >
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={3000}>
        {snackbar}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: { flex: 1, marginRight: spacing.md },
  headerRight: { alignItems: 'flex-end', gap: spacing.xs },
  syncRow: { flexDirection: 'row', alignItems: 'center' },
  greeting: { fontWeight: '700', marginTop: spacing.xs },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickActionCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    flex: 1,
    fontWeight: '600',
  },
  syncCard: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  syncContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentSection: { marginTop: spacing.xs },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
});
