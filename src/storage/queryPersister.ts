import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { getString, setString, remove } from './mmkv';

export const queryPersister = createSyncStoragePersister({
  storage: {
    getItem: (key) => getString(key) ?? null,
    setItem: (key, value) => setString(key, value),
    removeItem: (key) => remove(key),
  },
});
