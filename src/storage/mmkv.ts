import AsyncStorage from '@react-native-async-storage/async-storage';

const cache = new Map<string, string>();
let loaded = false;

async function ensureLoaded() {
  if (loaded) return;
  loaded = true;
  const keys = await AsyncStorage.getAllKeys();
  if (keys.length === 0) return;
  const entries = await AsyncStorage.multiGet(keys);
  for (const [key, value] of entries) {
    if (value !== null) {
      cache.set(key, value);
    }
  }
}

function persist(key: string, value: string) {
  cache.set(key, value);
  AsyncStorage.setItem(key, value);
}

function persistRemove(key: string) {
  cache.delete(key);
  AsyncStorage.removeItem(key);
}

export async function initStorage(): Promise<void> {
  await ensureLoaded();
}

export function getString(key: string, fallback = ''): string {
  return cache.get(key) ?? fallback;
}

export function setString(key: string, value: string): void {
  persist(key, value);
}

export function getBoolean(key: string, fallback = false): boolean {
  const raw = cache.get(key);
  if (raw === undefined) return fallback;
  return raw === 'true';
}

export function setBoolean(key: string, value: boolean): void {
  persist(key, value ? 'true' : 'false');
}

export function getNumber(key: string, fallback = 0): number {
  const raw = cache.get(key);
  if (raw === undefined) return fallback;
  return Number(raw);
}

export function setNumber(key: string, value: number): void {
  persist(key, String(value));
}

export function getObject<T>(key: string, fallback: T): T {
  const raw = cache.get(key);
  if (raw === undefined) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setObject<T>(key: string, value: T): void {
  persist(key, JSON.stringify(value));
}

export function remove(key: string): void {
  persistRemove(key);
}

export const StorageKeys = {
  USER_MODE: 'user_mode',
  HAS_LAUNCHED: 'has_launched',
  PIN_HASH: 'pin_hash',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_SYNC: 'last_sync',
  OFFLINE_QUEUE: 'offline_queue',
  PIN_VERIFIED_SESSION: 'pin_verified_session',
  LATEST_REQUEST: 'latest_request',
} as const;
