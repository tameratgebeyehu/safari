import type { CreateRequestPayload, OfflineQueueItem } from '../api/types';
import { getObject, setObject, StorageKeys } from '../storage/mmkv';

export function getOfflineQueue(): OfflineQueueItem[] {
  return getObject<OfflineQueueItem[]>(StorageKeys.OFFLINE_QUEUE, []);
}

export function enqueueRequest(payload: CreateRequestPayload): OfflineQueueItem {
  const queue = getOfflineQueue();
  const item: OfflineQueueItem = {
    id: payload.requestId,
    type: 'createRequest',
    payload,
    createdAt: Date.now(),
    retries: 0,
  };
  queue.push(item);
  setObject(StorageKeys.OFFLINE_QUEUE, queue);
  return item;
}

export function removeFromQueue(id: string): void {
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  setObject(StorageKeys.OFFLINE_QUEUE, queue);
}

export function incrementRetry(id: string): void {
  const queue = getOfflineQueue().map((item) =>
    item.id === id ? { ...item, retries: item.retries + 1 } : item
  );
  setObject(StorageKeys.OFFLINE_QUEUE, queue);
}

export function getQueueSize(): number {
  return getOfflineQueue().length;
}
