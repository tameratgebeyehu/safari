import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Dialog,
  FAB,
  Portal,
  Searchbar,
  Snackbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { EmptyState } from '../../../src/components/EmptyState';
import { SkeletonList } from '../../../src/components/Skeleton';
import {
  useCreateFavorite,
  useDeleteFavorite,
  useFavorites,
  useUpdateFavorite,
} from '../../../src/hooks/useFavorites';
import type { Favorite } from '../../../src/api/types';
import { generateFavoriteId } from '../../../src/utils/requestId';
import {
  formatPhoneDisplay,
  isValidEthiopianPhone,
  normalizePhoneNumber,
} from '../../../src/utils/phone';
import { spacing, colors, borderRadius } from '../../../src/theme/colors';

function getInitials(name: string): string {
  return name
    .trim()
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

function getAvatarColor(name: string): string {
  const palette = [
    '#2E7D32', '#1976D2', '#7B1FA2', '#E64A19',
    '#00838F', '#AD1457', '#558B2F', '#4527A0',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length]!;
}

export default function FavoritesScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: favorites, isLoading, refetch, isRefetching } = useFavorites();
  const createFavorite = useCreateFavorite();
  const updateFavorite = useUpdateFavorite();
  const deleteFavorite = useDeleteFavorite();

  const [search, setSearch] = useState('');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Favorite | null>(null);
  const [editing, setEditing] = useState<Favorite | null>(null);
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [description, setDescription] = useState('');
  const [snackbar, setSnackbar] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return favorites ?? [];
    const q = search.toLowerCase();
    return (favorites ?? []).filter(
      (f: Favorite) =>
        f.customerName.toLowerCase().includes(q) ||
        f.phoneNumber.includes(q) ||
        f.description.toLowerCase().includes(q)
    );
  }, [favorites, search]);

  const openCreate = () => {
    setEditing(null);
    setPhone('');
    setCustomerName('');
    setDescription('');
    setDialogVisible(true);
  };

  const openEdit = (favorite: Favorite) => {
    setEditing(favorite);
    setPhone(favorite.phoneNumber);
    setCustomerName(favorite.customerName);
    setDescription(favorite.description);
    setDialogVisible(true);
  };

  const handleSave = async () => {
    if (!isValidEthiopianPhone(phone) || !customerName.trim()) return;

    if (editing) {
      await updateFavorite.mutateAsync({
        favoriteId: editing.favoriteId,
        phoneNumber: normalizePhoneNumber(phone),
        customerName: customerName.trim(),
        description: description.trim(),
        userMode: 'receiver',
      });
    } else {
      const now = new Date();
      await createFavorite.mutateAsync({
        favoriteId: generateFavoriteId(),
        phoneNumber: normalizePhoneNumber(phone),
        customerName: customerName.trim(),
        description: description.trim(),
        createdDate: now.toISOString().split('T')[0],
        userMode: 'receiver',
      });
    }

    setDialogVisible(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteFavorite.mutateAsync(deleteTarget.favoriteId);
    setDeleteTarget(null);
  };

  const copyPhone = async (phone: string) => {
    await Clipboard.setStringAsync(phone);
    setSnackbar(t('common.copied'));
  };

  if (isLoading && !favorites) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Searchbar
          placeholder={t('favorites.searchPlaceholder')}
          onChangeText={setSearch}
          value={search}
          style={[styles.search, { backgroundColor: theme.colors.surface }]}
        />
        <View style={styles.listPadding}>
          <SkeletonList count={5} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder={t('favorites.searchPlaceholder')}
        onChangeText={setSearch}
        value={search}
        style={[styles.search, { backgroundColor: theme.colors.surface }]}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.favoriteId}
        contentContainerStyle={styles.listPadding}
        ListEmptyComponent={!isLoading ? <EmptyState message={t('favorites.empty')} /> : null}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} colors={[colors.primary]} />
        }
        renderItem={({ item }) => {
          const initials = getInitials(item.customerName);
          const avatarColor = getAvatarColor(item.customerName);
          return (
            <Pressable
              onLongPress={() => openEdit(item)}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline + '30',
                  opacity: pressed ? 0.94 : 1,
                },
              ]}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardRow}>
                  <Avatar.Text
                    size={48}
                    label={initials}
                    style={{ backgroundColor: avatarColor }}
                    labelStyle={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}
                  />
                  <View style={styles.cardInfo}>
                    <Text variant="titleSmall" style={[styles.customerName, { color: theme.colors.onSurface }]}>
                      {item.customerName}
                    </Text>
                    <View style={styles.phoneRow}>
                      <MaterialCommunityIcons name="phone" size={13} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 4 }}>
                        {formatPhoneDisplay(item.phoneNumber)}
                      </Text>
                    </View>
                    {item.description ? (
                      <Text
                        variant="bodySmall"
                        numberOfLines={1}
                        style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                      >
                        {item.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.cardActions}>
                  {/* Call Button (Future) */}
                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: colors.completed + '12' }]}
                    onPress={() => setSnackbar(t('requests.toastQuickComingSoon'))}
                  >
                    <MaterialCommunityIcons name="phone" size={18} color={colors.completed} />
                  </Pressable>

                  {/* Copy Button */}
                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: colors.processing + '12' }]}
                    onPress={() => copyPhone(item.phoneNumber)}
                  >
                    <MaterialCommunityIcons name="content-copy" size={18} color={colors.processing} />
                  </Pressable>

                  {/* Request Button (Future) */}
                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: colors.pending + '12' }]}
                    onPress={() => setSnackbar(t('requests.toastQuickComingSoon'))}
                  >
                    <MaterialCommunityIcons name="plus" size={18} color={colors.pending} />
                  </Pressable>

                  {/* Divider line in actions */}
                  <View style={styles.actionDivider} />

                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: colors.primary + '12' }]}
                    onPress={() => openEdit(item)}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
                  </Pressable>
                  <Pressable
                    style={[styles.iconBtn, { backgroundColor: colors.accent + '12' }]}
                    onPress={() => setDeleteTarget(item)}
                  >
                    <MaterialCommunityIcons name="delete" size={18} color={colors.accent} />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      <FAB icon="plus" style={styles.fab} onPress={openCreate} />

      <Portal>
        {/* Create / Edit Dialog */}
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{editing ? t('favorites.edit') : t('favorites.add')}</Dialog.Title>
          <Dialog.Content>
            <TextInput label={t('favorites.customerName')} value={customerName} onChangeText={setCustomerName} mode="outlined" style={styles.input} />
            <TextInput label={t('favorites.phone')} value={phone} onChangeText={setPhone} keyboardType="phone-pad" mode="outlined" style={styles.input} />
            <TextInput label={t('favorites.description')} value={description} onChangeText={setDescription} mode="outlined" multiline style={styles.input} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button mode="contained" onPress={handleSave} loading={createFavorite.isPending || updateFavorite.isPending}>
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog visible={!!deleteTarget} onDismiss={() => setDeleteTarget(null)}>
          <Dialog.Title>{t('common.delete')}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{t('favorites.confirmDelete')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>{t('common.cancel')}</Button>
            <Button mode="contained" buttonColor={colors.accent} onPress={handleDeleteConfirm} loading={deleteFavorite.isPending}>
              {t('common.delete')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snackbar} onDismiss={() => setSnackbar('')} duration={2000}>
        {snackbar}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: spacing.md },
  listPadding: { padding: spacing.md, paddingBottom: 80, flexGrow: 1 },
  card: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: spacing.md,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  cardInfo: { flex: 1 },
  customerName: { fontWeight: '700' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.08)',
    paddingTop: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(128,128,128,0.2)',
    marginHorizontal: spacing.xs,
    alignSelf: 'center',
  },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg },
  input: { marginBottom: spacing.sm },
});
