import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Button,
  Card,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Portal,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDeleteRequest, useRequests, useUpdateRequest } from '../../../src/hooks/useRequests';
import { useCreateFavorite, useFavorites } from '../../../src/hooks/useFavorites';
import type { Request } from '../../../src/api/types';
import { formatPhoneDisplay } from '../../../src/utils/phone';
import { getStatusColor } from '../../../src/utils/requestHelpers';
import { generateFavoriteId } from '../../../src/utils/requestId';
import { getEthiopianDateTime } from '../../../src/utils/ethiopianDate';
import { spacing, borderRadius, colors } from '../../../src/theme/colors';
import type { RequestStatus } from '../../../src/constants';

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { data: requests } = useRequests();
  const { data: favorites } = useFavorites();
  const updateRequest = useUpdateRequest();
  const deleteRequest = useDeleteRequest();
  const createFavorite = useCreateFavorite();

  const request = requests?.find((r: Request) => r.requestId === id);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [cancelDialogVisible, setCancelDialogVisible] = useState(false);
  const [snackbar, setSnackbar] = useState('');

  if (!request) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          {t('common.noData')}
        </Text>
        <Button mode="text" onPress={() => router.back()}>
          {t('common.back')}
        </Button>
      </View>
    );
  }

  const isFavorited = (favorites ?? []).some((fav) => fav.phoneNumber === request.buyerPhone);

  const statusColor = getStatusColor(request.status);
  const statusKey = `requests.status${request.status}` as const;

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    setSnackbar(t('common.copied'));
  };

  const updateStatus = async (status: RequestStatus) => {
    const ethDateTime = getEthiopianDateTime();
    await updateRequest.mutateAsync({
      requestId: request.requestId,
      status,
      completedDate: status === 'Completed' ? ethDateTime.ethiopianDate : undefined,
      completedTime: status === 'Completed' ? ethDateTime.ethiopianTime : undefined,
      userMode: 'receiver',
    });
    setSnackbar(t('common.save'));
  };

  const handleEditDescription = async () => {
    await updateRequest.mutateAsync({
      requestId: request.requestId,
      description: editDescription.trim(),
      userMode: 'receiver',
    });
    setEditDialogVisible(false);
    setSnackbar(t('common.save'));
  };

  const handleAddToFavorites = async () => {
    if (isFavorited) {
      setSnackbar(t('common.save'));
      return;
    }
    const now = new Date();
    await createFavorite.mutateAsync({
      favoriteId: generateFavoriteId(),
      phoneNumber: request.buyerPhone,
      customerName: request.buyerPhone,
      description: request.description,
      createdDate: now.toISOString().split('T')[0],
      userMode: 'receiver',
    });
    setSnackbar(t('common.save'));
  };

  const handleDelete = async () => {
    setDeleteDialogVisible(false);
    await deleteRequest.mutateAsync(request.requestId);
    router.back();
  };

  const handleCancelRequest = async () => {
    setCancelDialogVisible(false);
    await updateStatus('Cancelled');
  };

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Customer Info Card */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.customerHeaderRow}>
            <View>
              <Text variant="labelLarge" style={{ color: theme.colors.primary, fontWeight: '700' }}>
                {t('requests.customerInfo')}
              </Text>
              <Text variant="headlineSmall" style={styles.phoneDisplay}>
                🇪🇹 {formatPhoneDisplay(request.buyerPhone)}
              </Text>
            </View>
            <View style={styles.customerHeaderActions}>
              <IconButton
                icon="content-copy"
                size={22}
                onPress={() => copyToClipboard(request.buyerPhone)}
                style={{ backgroundColor: theme.colors.surfaceVariant }}
              />
              <IconButton
                icon={isFavorited ? "star" : "star-outline"}
                iconColor={isFavorited ? '#F59E0B' : undefined}
                size={22}
                onPress={handleAddToFavorites}
                style={{ backgroundColor: theme.colors.surfaceVariant }}
                disabled={isFavorited}
              />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Request Info Card */}
      <Card style={styles.card} mode="elevated">
        <Card.Content style={styles.requestInfoContent}>
          <Text variant="labelLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>
            {t('requests.requestInfo')}
          </Text>
          <Divider style={styles.divider} />
          
          <View style={styles.infoGridRow}>
            <View style={styles.infoCell}>
              <Text variant="labelSmall" style={styles.cellLabel}>{t('requests.amount')}</Text>
              <Text variant="headlineMedium" style={[styles.cellValue, { color: theme.colors.primary }]}>
                {request.amount} ETB
              </Text>
            </View>
            <View style={styles.infoCell}>
              <Text variant="labelSmall" style={styles.cellLabel}>{t('requests.status')}</Text>
              <Chip
                compact
                style={[styles.statusChip, { backgroundColor: statusColor + '22' }]}
                textStyle={{ color: statusColor, fontWeight: '700', fontSize: 13 }}
              >
                {`${getStatusEmoji(request.status)} ${t(statusKey)}`}
              </Chip>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text variant="labelSmall" style={styles.detailLabel}>{t('requests.description')}</Text>
            <Text variant="bodyMedium" style={styles.detailValue}>
              {request.description || t('common.noData')}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="labelSmall" style={styles.detailLabel}>{t('requests.date')}</Text>
            <Text variant="bodyMedium" style={styles.detailValue}>
              📅 {request.createdDate} · 🕐 {request.createdTime}
            </Text>
          </View>

          {request.status === 'Completed' && request.completedDate && (
            <View style={styles.detailRow}>
              <Text variant="labelSmall" style={styles.detailLabel}>{t('requests.completedDate')}</Text>
              <Text variant="bodyMedium" style={[styles.detailValue, { color: colors.completed, fontWeight: '600' }]}>
                📅 {request.completedDate} · 🕐 {request.completedTime}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text variant="labelSmall" style={styles.detailLabel}>{t('requests.requestId')}</Text>
            <Text variant="bodySmall" style={styles.detailValueId}>
              {request.requestId}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Actions Card */}
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <Text variant="labelLarge" style={[styles.cardTitle, { color: theme.colors.primary }]}>
            {t('requests.actions')}
          </Text>
          <Divider style={styles.divider} />

          {/* Primary Action Button (Mark Completed) - Always the largest button */}
          <Button
            mode="contained"
            icon="check-circle"
            style={styles.primaryActionButton}
            buttonColor={colors.completed}
            onPress={() => updateStatus('Completed')}
            loading={updateRequest.isPending}
            disabled={request.status === 'Completed'}
            contentStyle={styles.primaryActionButtonContent}
            labelStyle={styles.primaryActionButtonLabel}
          >
            {t('requests.markCompleted')}
          </Button>

          <View style={styles.actionGrid}>
            <Button
              mode="contained"
              icon="progress-clock"
              style={styles.actionGridItem}
              buttonColor={colors.processing}
              onPress={() => updateStatus('Processing')}
              loading={updateRequest.isPending}
              disabled={request.status === 'Processing' || request.status === 'Completed'}
            >
              {t('requests.markProcessing')}
            </Button>

            <Button
              mode="outlined"
              icon="pencil"
              style={styles.actionGridItem}
              onPress={() => { setEditDescription(request.description); setEditDialogVisible(true); }}
            >
              {t('requests.editDescription')}
            </Button>
          </View>

          <View style={styles.actionGrid}>
            <Button
              mode="outlined"
              icon="phone-outline"
              style={styles.actionGridItem}
              onPress={() => copyToClipboard(request.buyerPhone)}
            >
              {t('requests.copyPhone')}
            </Button>

            <Button
              mode="outlined"
              icon="cash-outline"
              style={styles.actionGridItem}
              onPress={() => copyToClipboard(String(request.amount))}
            >
              {t('requests.copyAmount')}
            </Button>
          </View>

          <Button
            mode="outlined"
            icon="star-outline"
            style={styles.fullWidthActionBtn}
            onPress={handleAddToFavorites}
            loading={createFavorite.isPending}
            disabled={isFavorited}
          >
            {t('requests.addToFavorites')}
          </Button>

          <Divider style={styles.dividerSpacer} />

          <Text variant="labelSmall" style={[styles.dangerHeader, { color: colors.accent }]}>
            {t('requests.dangerZone')}
          </Text>

          <View style={styles.actionGrid}>
            <Button
              mode="outlined"
              icon="cancel"
              style={[styles.actionGridItem, { borderColor: colors.accent }]}
              textColor={colors.accent}
              onPress={() => setCancelDialogVisible(true)}
              disabled={request.status === 'Cancelled' || request.status === 'Completed'}
            >
              {t('requests.cancelRequest')}
            </Button>

            <Button
              mode="contained"
              icon="delete"
              style={styles.actionGridItem}
              buttonColor={colors.accent}
              onPress={() => setDeleteDialogVisible(true)}
              loading={deleteRequest.isPending}
            >
              {t('requests.deleteRequest')}
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Dialogs */}
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>{t('requests.editDescription')}</Dialog.Title>
          <Dialog.Content>
            <TextInput value={editDescription} onChangeText={setEditDescription} mode="outlined" multiline maxLength={100} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button mode="contained" onPress={handleEditDescription}>{t('common.save')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>{t('requests.deleteRequest')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('requests.confirmDelete')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button mode="contained" buttonColor={colors.accent} onPress={handleDelete}>{t('common.delete')}</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={cancelDialogVisible} onDismiss={() => setCancelDialogVisible(false)}>
          <Dialog.Title>{t('requests.cancelRequest')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('requests.confirmCancel')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button mode="contained" onPress={handleCancelRequest}>{t('common.confirm')}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={2000}>
        {snackbar}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  card: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  cardTitle: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  dividerSpacer: {
    marginVertical: spacing.md,
  },
  customerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneDisplay: {
    fontWeight: '800',
    marginTop: spacing.xs,
  },
  customerHeaderActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  requestInfoContent: {
    paddingVertical: spacing.sm,
  },
  infoGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  infoCell: {
    flex: 1,
  },
  cellLabel: {
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cellValue: {
    fontWeight: '800',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  detailRow: {
    marginBottom: spacing.sm,
  },
  detailLabel: {
    opacity: 0.6,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailValue: {
    fontWeight: '500',
  },
  detailValueId: {
    fontFamily: 'monospace',
    opacity: 0.5,
  },
  primaryActionButton: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    width: '100%',
  },
  primaryActionButtonContent: {
    height: 54,
  },
  primaryActionButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  actionGridItem: {
    flex: 1,
    borderRadius: borderRadius.sm,
  },
  fullWidthActionBtn: {
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
    width: '100%',
  },
  dangerHeader: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
});
