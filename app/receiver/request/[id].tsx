import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Portal,
  Snackbar,
  Text,
  TextInput,
  useTheme,
  Surface,
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

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<string, string> = {
  Pending: 'clock-outline',
  Processing: 'progress-clock',
  Completed: 'check-circle',
  Cancelled: 'close-circle',
};

const STATUS_LABELS: Record<string, string> = {
  Pending: 'Pending',
  Processing: 'Processing',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

// ─── Sub-components ────────────────────────────────────────────────────────────

interface InfoRowProps {
  label: string;
  value: string;
  mono?: boolean;
  valueColor?: string;
  icon?: string;
}

function InfoRow({ label, value, mono, valueColor, icon }: InfoRowProps) {
  const theme = useTheme();
  return (
    <View style={rowStyles.container}>
      <Text style={[rowStyles.label, { color: theme.colors.onSurfaceVariant }]}>{label}</Text>
      <View style={rowStyles.valueRow}>
        {icon && (
          <MaterialCommunityIcons
            name={icon as any}
            size={14}
            color={valueColor || theme.colors.onSurface}
            style={{ marginRight: 4 }}
          />
        )}
        <Text
          style={[
            rowStyles.value,
            mono && rowStyles.mono,
            { color: valueColor || theme.colors.onSurface },
          ]}
          numberOfLines={mono ? 1 : undefined}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  valueRow: { flexDirection: 'row', alignItems: 'center' },
  value: { fontSize: 14, fontWeight: '500', flex: 1 },
  mono: { fontFamily: 'monospace', fontSize: 12, opacity: 0.7 },
});

// ─── Main Screen ───────────────────────────────────────────────────────────────

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
        <MaterialCommunityIcons name="file-search-outline" size={48} color={theme.colors.onSurfaceVariant} />
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
          Request not found
        </Text>
        <Button mode="text" onPress={() => router.back()} style={{ marginTop: 8 }}>
          Go Back
        </Button>
      </View>
    );
  }

  const isFavorited = (favorites ?? []).some((fav) => fav.phoneNumber === request.buyerPhone);
  const statusColor = getStatusColor(request.status);
  const statusIcon = STATUS_ICONS[request.status] || 'help-circle-outline';

  // ── Handlers ──────────────────────────────────────────────────────────────

  const copyToClipboard = async (text: string, label = 'Copied') => {
    await Clipboard.setStringAsync(text);
    setSnackbar(`${label} copied`);
  };

  const updateStatus = async (status: RequestStatus) => {
    const ethDateTime = getEthiopianDateTime();
    try {
      await updateRequest.mutateAsync({
        requestId: request.requestId,
        status,
        completedDate: status === 'Completed' ? ethDateTime.ethiopianDate : undefined,
        completedTime: status === 'Completed' ? ethDateTime.ethiopianTime : undefined,
        userMode: 'receiver',
      });
      setSnackbar(`Marked as ${status}`);
    } catch (err: any) {
      setSnackbar(err.message || `Failed to update to ${status}`);
    }
  };

  const handleEditDescription = async () => {
    try {
      await updateRequest.mutateAsync({
        requestId: request.requestId,
        description: editDescription.trim(),
        userMode: 'receiver',
      });
      setSnackbar('Note updated');
    } catch (err: any) {
      setSnackbar(err.message || 'Failed to update note');
    } finally {
      setEditDialogVisible(false);
    }
  };

  const handleAddToFavorites = async () => {
    if (isFavorited) return;
    const now = new Date();
    try {
      await createFavorite.mutateAsync({
        favoriteId: generateFavoriteId(),
        phoneNumber: request.buyerPhone,
        customerName: request.buyerPhone,
        description: request.description,
        createdDate: now.toISOString().split('T')[0],
        userMode: 'receiver',
      });
      setSnackbar('Added to favourites');
    } catch (err: any) {
      setSnackbar(err.message || 'Failed to add to favorites');
    }
  };

  const handleDelete = async () => {
    setDeleteDialogVisible(false);
    try {
      await deleteRequest.mutateAsync(request.requestId);
      router.back();
    } catch (err: any) {
      setSnackbar(err.message || 'Failed to delete request');
    }
  };

  const handleCancelRequest = async () => {
    setCancelDialogVisible(false);
    await updateStatus('Cancelled');
  };

  // ── Derived display values ────────────────────────────────────────────────

  const amountFormatted = Number(request.amount).toLocaleString('en-ET');
  const phoneFormatted = formatPhoneDisplay(request.buyerPhone);
  const createdDisplay = `${request.createdDate}  ·  ${request.createdTime}`;
  const completedDisplay = request.completedDate
    ? `${request.completedDate}  ·  ${request.completedTime}`
    : '';

  const isCompleted = request.status === 'Completed';
  const isCancelled = request.status === 'Cancelled';
  const isProcessing = request.status === 'Processing';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── CUSTOMER CARD ── */}
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        {/* Phone + actions row */}
        <View style={styles.customerTop}>
          <View style={styles.customerLeft}>
            <View style={styles.flagRow}>
              <Text style={styles.flag}>🇪🇹</Text>
              <Text style={[styles.phoneNumber, { color: theme.colors.onSurface }]}>
                {phoneFormatted}
              </Text>
            </View>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                <MaterialCommunityIcons name={statusIcon as any} size={13} color={statusColor} />
                <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                  {STATUS_LABELS[request.status]}
                </Text>
              </View>
            </View>
          </View>

          {/* Icon actions — the only place copy + favourite appear */}
          <View style={styles.customerActions}>
            <TouchableOpacity
              style={[styles.iconAction, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={() => copyToClipboard(request.buyerPhone, 'Phone number')}
            >
              <MaterialCommunityIcons name="content-copy" size={18} color={theme.colors.onSurfaceVariant} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.iconAction,
                {
                  backgroundColor: isFavorited
                    ? '#F59E0B22'
                    : theme.colors.surfaceVariant,
                },
              ]}
              onPress={handleAddToFavorites}
              disabled={isFavorited}
            >
              <MaterialCommunityIcons
                name={isFavorited ? 'star' : 'star-outline'}
                size={18}
                color={isFavorited ? '#F59E0B' : theme.colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Divider style={{ marginVertical: 12 }} />

        {/* Request ID */}
        <View style={styles.idRow}>
          <MaterialCommunityIcons name="identifier" size={13} color={theme.colors.onSurfaceVariant} />
          <Text style={[styles.idText, { color: theme.colors.onSurfaceVariant }]}>
            {request.requestId}
          </Text>
          <TouchableOpacity onPress={() => copyToClipboard(request.requestId, 'Request ID')}>
            <MaterialCommunityIcons name="content-copy" size={13} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </Surface>

      {/* ── DETAILS CARD ── */}
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>

        {/* Amount hero */}
        <View style={styles.amountRow}>
          <View style={styles.amountLeft}>
            <Text style={[styles.amountLabel, { color: theme.colors.onSurfaceVariant }]}>
              AMOUNT
            </Text>
            <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
              {amountFormatted}
              <Text style={[styles.amountUnit, { color: theme.colors.onSurfaceVariant }]}> {t('common.currency')}</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.copyAmount, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => copyToClipboard(String(request.amount), 'Amount')}
          >
            <MaterialCommunityIcons name="content-copy" size={14} color={theme.colors.onSurfaceVariant} />
            <Text style={[styles.copyAmountText, { color: theme.colors.onSurfaceVariant }]}>Copy</Text>
          </TouchableOpacity>
        </View>

        <Divider style={{ marginVertical: 12 }} />

        {/* Description */}
        <InfoRow
          label="Note / Description"
          value={request.description || '—'}
          icon="text-box-outline"
        />

        {/* Created */}
        <InfoRow
          label="Requested On"
          value={createdDisplay}
          icon="calendar-clock"
        />

        {/* Completed */}
        {isCompleted && completedDisplay ? (
          <InfoRow
            label="Completed On"
            value={completedDisplay}
            icon="check-circle-outline"
            valueColor={colors.completed}
          />
        ) : null}
      </Surface>

      {/* ── ACTIONS CARD ── */}
      <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <Text style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          ACTIONS
        </Text>

        {/* Primary action */}
        <Button
          mode="contained"
          icon="check-circle"
          buttonColor={colors.completed}
          contentStyle={styles.primaryContent}
          labelStyle={styles.primaryLabel}
          style={styles.primaryBtn}
          onPress={() => updateStatus('Completed')}
          loading={updateRequest.isPending}
          disabled={isCompleted}
        >
          Mark as Completed
        </Button>

        {/* Secondary row */}
        <View style={styles.secondaryRow}>
          <Button
            mode="contained-tonal"
            icon="progress-clock"
            style={styles.secondaryBtn}
            buttonColor={colors.processing + '22'}
            textColor={colors.processing}
            onPress={() => updateStatus('Processing')}
            loading={updateRequest.isPending}
            disabled={isProcessing || isCompleted}
          >
            Processing
          </Button>
          <Button
            mode="outlined"
            icon="pencil-outline"
            style={styles.secondaryBtn}
            onPress={() => {
              setEditDescription(request.description || '');
              setEditDialogVisible(true);
            }}
          >
            Edit Note
          </Button>
        </View>

        <Divider style={styles.dangerDivider} />

        {/* Danger zone */}
        <Text style={[styles.dangerLabel, { color: colors.cancelled }]}>
          DANGER ZONE
        </Text>
        <View style={styles.secondaryRow}>
          <Button
            mode="outlined"
            icon="cancel"
            style={[styles.secondaryBtn, { borderColor: colors.cancelled }]}
            textColor={colors.cancelled}
            onPress={() => setCancelDialogVisible(true)}
            disabled={isCancelled || isCompleted}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            icon="delete-outline"
            style={styles.secondaryBtn}
            buttonColor={colors.cancelled}
            onPress={() => setDeleteDialogVisible(true)}
            loading={deleteRequest.isPending}
          >
            Delete
          </Button>
        </View>
      </Surface>

      {/* ── DIALOGS ── */}
      <Portal>
        {/* Edit note */}
        <Dialog
          visible={editDialogVisible}
          onDismiss={() => setEditDialogVisible(false)}
          style={[styles.dialog, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Dialog.Title>
            <View style={styles.dialogTitleContainer}>
              <MaterialCommunityIcons name="note-edit-outline" size={24} color={colors.primary} />
              <Text style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>Edit Note</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <TextInput
              value={editDescription}
              onChangeText={setEditDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              maxLength={100}
              placeholder="Add a note…"
              activeOutlineColor={colors.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)} labelStyle={{ color: theme.colors.onSurfaceVariant }}>
              Cancel
            </Button>
            <Button mode="contained" onPress={handleEditDescription} loading={updateRequest.isPending} buttonColor={colors.primary} style={{ borderRadius: 12 }}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Delete */}
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
          style={[styles.dialog, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Dialog.Title>
            <View style={styles.dialogTitleContainer}>
              <MaterialCommunityIcons name="delete-alert" size={24} color={colors.cancelled} />
              <Text style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>Delete Request?</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text variant="bodyMedium" style={{ lineHeight: 20, color: theme.colors.onSurfaceVariant }}>
              This will permanently remove the request from {phoneFormatted}. This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)} labelStyle={{ color: theme.colors.onSurfaceVariant }}>
              Cancel
            </Button>
            <Button mode="contained" buttonColor={colors.cancelled} onPress={handleDelete} loading={deleteRequest.isPending} style={{ borderRadius: 12 }}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Cancel request */}
        <Dialog
          visible={cancelDialogVisible}
          onDismiss={() => setCancelDialogVisible(false)}
          style={[styles.dialog, { backgroundColor: theme.colors.elevation.level3 }]}
        >
          <Dialog.Title>
            <View style={styles.dialogTitleContainer}>
              <MaterialCommunityIcons name="close-circle-outline" size={24} color={colors.cancelled} />
              <Text style={[styles.dialogTitle, { color: theme.colors.onSurface }]}>Cancel Request?</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content style={styles.dialogContent}>
            <Text variant="bodyMedium" style={{ lineHeight: 20, color: theme.colors.onSurfaceVariant }}>
              Mark this request from {phoneFormatted} as cancelled?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelDialogVisible(false)} labelStyle={{ color: theme.colors.onSurfaceVariant }}>
              No, Keep It
            </Button>
            <Button mode="contained" buttonColor={colors.cancelled} onPress={handleCancelRequest} loading={updateRequest.isPending} style={{ borderRadius: 12 }}>
              Yes, Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={1800}
        style={{ borderRadius: 12 }}
      >
        {snackbar}
      </Snackbar>
    </ScrollView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  dialog: {
    borderRadius: 24,
    paddingVertical: spacing.xs,
  },
  dialogTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.xs,
  },
  dialogTitle: {
    fontWeight: '800',
    fontSize: 20,
    letterSpacing: 0.3,
  },
  dialogContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Card shell
  card: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },

  // Customer card
  customerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerLeft: { flex: 1 },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  flag: { fontSize: 20 },
  phoneNumber: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  badgeRow: { flexDirection: 'row', gap: 6 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  customerActions: { flexDirection: 'row', gap: 8, marginLeft: 12 },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  idText: {
    fontSize: 11,
    fontFamily: 'monospace',
    flex: 1,
    opacity: 0.7,
  },

  // Details card
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountLeft: {},
  amountLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  amountUnit: {
    fontSize: 16,
    fontWeight: '500',
  },
  copyAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyAmountText: { fontSize: 12, fontWeight: '600' },

  // Actions card
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  primaryBtn: {
    borderRadius: 12,
    marginBottom: 10,
  },
  primaryContent: { height: 52 },
  primaryLabel: { fontSize: 15, fontWeight: '700' },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 10,
  },
  dangerDivider: { marginVertical: 14 },
  dangerLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
});
