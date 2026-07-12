import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStatus } from './useNetworkStatus';
import { syncAll, isSyncing, detectRequestChanges, detectFavoriteChanges } from '../services/SyncService';
import { REQUESTS_QUERY_KEY } from './useRequests';
import { FAVORITES_QUERY_KEY } from './useFavorites';
import { useAppStore } from '../store/appStore';
import { isApiConfigured } from '../api/client';
import i18n from '../i18n';
import type { Request, Favorite } from '../api/types';
import { triggerLocalNotification } from '../services/NotificationService';
import { formatPhoneDisplay } from '../utils/phone';

const SYNC_INTERVAL_MS = 1000;

export function useAutoSync() {
  const { isConnected } = useNetworkStatus();
  const queryClient = useQueryClient();
  const wasOffline = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const prevRequestsRef = useRef<Request[] | null>(null);
  const prevFavoritesRef = useRef<Favorite[] | null>(null);
  const initialLoadDone = useRef(false);
  const syncRequested = useAppStore((s) => s.syncRequested);
  const handledSyncRequestRef = useRef(syncRequested);
  const consecutiveFailures = useRef(0);

  const doSync = useCallback(async () => {
    if (!isConnected || !isApiConfigured() || isSyncing()) return;

    const store = useAppStore.getState();

    store.setSyncStatus('syncing');

    const result = await syncAll();

    if (!result) {
      consecutiveFailures.current++;
      if (consecutiveFailures.current >= 3 && store.userMode === 'receiver') {
        store.setNotification({
          id: 'sync-fail',
          message: i18n.t('sync.syncFailed'),
          type: 'error',
        });
      }
      return;
    }

    consecutiveFailures.current = 0;

    // Only update cache if data actually changed (avoids unnecessary re-renders)
    const reqsChanged = !prevRequestsRef.current || detectRequestChanges(prevRequestsRef.current, result.requests).length > 0;
    const favsChanged = !prevFavoritesRef.current || detectFavoriteChanges(prevFavoritesRef.current, result.favorites).length > 0;

    if (reqsChanged) queryClient.setQueryData(REQUESTS_QUERY_KEY, result.requests);
    if (favsChanged) queryClient.setQueryData(FAVORITES_QUERY_KEY, result.favorites);

    if (initialLoadDone.current) {
      const userMode = store.userMode;
      const reqChanges = detectRequestChanges(prevRequestsRef.current, result.requests);
      const favChanges = detectFavoriteChanges(prevFavoritesRef.current, result.favorites);

      if (reqChanges.length > 0 && userMode === 'receiver') {
        for (const change of reqChanges) {
          const notification = buildRequestNotification(change);
          if (notification) {
            const reqDetails = result.requests.find((r) => r.requestId === change.requestId);
            const formattedPhone = reqDetails ? formatPhoneDisplay(reqDetails.buyerPhone) : '';
            const amountVal = reqDetails ? reqDetails.amount : '';
            const title = i18n.t('sync.newRequestNotifTitle');
            const body = reqDetails
              ? `${i18n.t('requests.phone')}: ${formattedPhone} | ${i18n.t('requests.amount')}: ${amountVal} ${i18n.t('common.currency')}`
              : notification.message;

            store.setNotification({
              id: notification.id,
              message: body,
              type: notification.type,
              title,
              requestId: change.requestId,
            });

            if (change.type === 'created') {
              triggerLocalNotification(title, body);
            }
            break;
          }
        }
      }

      if (favChanges.length > 0 && userMode === 'receiver') {
        store.setNotification({ id: 'fav-update', message: i18n.t('sync.dataRefreshed'), type: 'info' });
      }

    } else {
      initialLoadDone.current = true;
    }

    // Update sender latest request status (works for both modes, including initial sync)
    const latestReq = store.latestRequest;
    if (latestReq) {
      const updated = result.requests.find((r) => r.requestId === latestReq.requestId);
      if (updated && updated.status !== latestReq.status) {
        store.setLatestRequest({
          requestId: updated.requestId,
          buyerPhone: updated.buyerPhone,
          amount: updated.amount,
          createdDate: updated.createdDate,
          createdTime: updated.createdTime,
          status: updated.status,
        });

        // Trigger system notification for sender if request status is updated
        if (store.userMode === 'sender' && initialLoadDone.current) {
          let title = i18n.t('sender.latestRequest');
          let body = `${i18n.t('requests.amount')}: ${updated.amount} ${i18n.t('common.currency')}`;
          let nType: 'info' | 'success' | 'error' = 'info';
          if (updated.status === 'Completed') {
            title = i18n.t('sync.requestCompletedTitle');
            body = `${i18n.t('sync.requestCompleted')} — ${updated.amount} ${i18n.t('common.currency')}`;
            nType = 'success';
          } else if (updated.status === 'Processing') {
            title = i18n.t('sync.requestProcessingTitle');
            body = `${i18n.t('sync.requestProcessing')} — ${updated.amount} ${i18n.t('common.currency')}`;
            nType = 'info';
          } else if (updated.status === 'Cancelled') {
            title = i18n.t('sync.requestCancelledTitle');
            body = `${i18n.t('sync.requestCancelled')} — ${updated.amount} ${i18n.t('common.currency')}`;
            nType = 'error';
          }

          store.setNotification({
            id: `status-${updated.requestId}-${updated.status}`,
            message: body,
            type: nType,
            title,
            requestId: updated.requestId,
          });

          triggerLocalNotification(title, body);
        }
      }
    }

    prevRequestsRef.current = result.requests;
    prevFavoritesRef.current = result.favorites;
    store.setSyncStatus('idle');
  }, [isConnected, queryClient]);

  useEffect(() => {
    if (!isApiConfigured()) return;
    const timer = setTimeout(() => doSync(), 500);
    return () => clearTimeout(timer);
  }, [doSync]);

  useEffect(() => {
    if (!isConnected) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(doSync, SYNC_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isConnected, doSync]);

  useEffect(() => {
    if (isConnected && wasOffline.current) {
      wasOffline.current = false;
      useAppStore.getState().setNotification({ id: 'reconnect', message: i18n.t('sync.connectionRestored'), type: 'success' });
      doSync();
    }
    if (!isConnected) {
      wasOffline.current = true;
    }
  }, [isConnected, doSync]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isConnected) {
        doSync();
      }
    });
    return () => sub.remove();
  }, [isConnected, doSync]);

  useEffect(() => {
    if (syncRequested > handledSyncRequestRef.current) {
      handledSyncRequestRef.current = syncRequested;
      doSync();
    }
  }, [syncRequested, doSync]);
}

function buildRequestNotification(
  change: { type: 'created' | 'updated' | 'deleted'; requestId: string; status?: string; prevStatus?: string },
): { id: string; message: string; type: 'info' | 'success' | 'error' } | null {
  if (change.type === 'created') {
    return { id: `new-${change.requestId}`, message: i18n.t('sync.newRequest'), type: 'info' };
  }
  if (change.type === 'deleted') {
    return { id: `del-${change.requestId}`, message: i18n.t('sync.requestRemoved'), type: 'info' };
  }
  if (change.type === 'updated' && change.status) {
    if (change.status === 'Completed') return { id: `complete-${change.requestId}`, message: i18n.t('sync.requestCompleted'), type: 'success' };
    if (change.status === 'Processing') return { id: `process-${change.requestId}`, message: i18n.t('sync.requestProcessing'), type: 'info' };
    if (change.status === 'Cancelled') return { id: `cancel-${change.requestId}`, message: i18n.t('sync.requestCancelled'), type: 'error' };
  }
  return null;
}
