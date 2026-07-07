import { isApiConfigured } from '../api/client';
import { requestRepository, favoriteRepository } from '../repositories/appsScriptRepository';
import { useAppStore } from '../store/appStore';
import { getOfflineQueue, incrementRetry, removeFromQueue } from './OfflineQueue';
import type { Request, Favorite } from '../api/types';

let syncing = false;

export function isSyncing(): boolean {
  return syncing;
}

export async function flushOfflineQueue(): Promise<number> {
  if (syncing || !isApiConfigured()) return 0;

  syncing = true;
  const queue = getOfflineQueue();
  let flushed = 0;

  for (const item of queue) {
    if (item.type !== 'createRequest') continue;
    if (item.retries >= 3) continue;

    try {
      await requestRepository.create(item.payload);
      removeFromQueue(item.id);
      flushed++;
    } catch {
      incrementRetry(item.id);
    }
  }

  if (flushed > 0 || queue.length === 0) {
    useAppStore.getState().setLastSyncAt(Date.now());
  }

  syncing = false;
  return flushed;
}

export interface SyncResult {
  requests: Request[];
  favorites: Favorite[];
}

export async function syncAll(): Promise<SyncResult | null> {
  if (syncing || !isApiConfigured()) return null;

  syncing = true;
  useAppStore.getState().setSyncStatus('syncing');
  useAppStore.getState().setSyncMessage('');

  try {
    await flushOfflineQueue();
    const [requests, favorites] = await Promise.all([
      requestRepository.getAll(),
      favoriteRepository.getAll(),
    ]);
    useAppStore.getState().setLastSyncAt(Date.now());
    useAppStore.getState().setSyncStatus('idle');
    return { requests, favorites };
  } catch {
    useAppStore.getState().setSyncStatus('error');
    useAppStore.getState().setSyncMessage('Sync failed');
    return null;
  } finally {
    syncing = false;
  }
}

const FALLBACK_T = (key: string): string => {
  const map: Record<string, string> = {
    'sync.justNow': 'Just now',
    'sync.secondsAgo': 'seconds ago',
    'sync.minutesAgo': 'minutes ago',
  };
  return map[key] ?? key;
};

export function formatLastSync(timestamp: number | null, t?: (key: string) => string): string {
  if (!timestamp) return '';
  const now = Date.now();
  const diff = now - timestamp;
  const _t = t ?? FALLBACK_T;

  if (diff < 2000) return _t('sync.justNow');
  if (diff < 60000) return `${Math.floor(diff / 1000)} ${_t('sync.secondsAgo')}`;
  if (diff < 120000) return `1 ${_t('sync.minutesAgo')}`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)} ${_t('sync.minutesAgo')}`;
  return new Date(timestamp).toLocaleString();
}

export function detectFavoriteChanges(
  oldFavs: Favorite[] | null,
  newFavs: Favorite[]
): Array<{ type: 'created' | 'deleted'; favoriteId: string }> {
  const changes: Array<{ type: 'created' | 'deleted'; favoriteId: string }> = [];
  if (!oldFavs) return changes;

  const oldMap = new Map(oldFavs.map((f) => [f.favoriteId, f]));
  const newMap = new Map(newFavs.map((f) => [f.favoriteId, f]));

  for (const fav of newFavs) {
    if (!oldMap.has(fav.favoriteId)) {
      changes.push({ type: 'created', favoriteId: fav.favoriteId });
    }
  }
  for (const fav of oldFavs) {
    if (!newMap.has(fav.favoriteId)) {
      changes.push({ type: 'deleted', favoriteId: fav.favoriteId });
    }
  }
  return changes;
}

export function detectRequestChanges(
  oldReqs: Request[] | null,
  newReqs: Request[]
): Array<{ type: 'created' | 'updated' | 'deleted'; requestId: string; status?: string; prevStatus?: string }> {
  const changes: Array<{ type: 'created' | 'updated' | 'deleted'; requestId: string; status?: string; prevStatus?: string }> = [];

  if (!oldReqs) return changes;

  const oldMap = new Map(oldReqs.map((r) => [r.requestId, r]));
  const newMap = new Map(newReqs.map((r) => [r.requestId, r]));

  for (const req of newReqs) {
    const old = oldMap.get(req.requestId);
    if (!old) {
      changes.push({ type: 'created', requestId: req.requestId, status: req.status });
    } else if (old.status !== req.status) {
      changes.push({ type: 'updated', requestId: req.requestId, status: req.status, prevStatus: old.status });
    }
  }

  for (const req of oldReqs) {
    if (!newMap.has(req.requestId)) {
      changes.push({ type: 'deleted', requestId: req.requestId });
    }
  }

  return changes;
}
