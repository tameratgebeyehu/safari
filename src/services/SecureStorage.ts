import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { getString, setString, remove, StorageKeys } from '../storage/mmkv';

const SECURE_KEYS = new Set<string>([
  StorageKeys.PIN_HASH,
  StorageKeys.API_KEY,
  StorageKeys.API_URL,
]);

async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return SecureStore.isAvailableAsync();
}

export async function setSecureString(key: string, value: string): Promise<void> {
  if (SECURE_KEYS.has(key) && (await isSecureStoreAvailable())) {
    await SecureStore.setItemAsync(key, value);
  } else {
    setString(key, value);
  }
}

export async function getSecureString(key: string, fallback = ''): Promise<string> {
  if (SECURE_KEYS.has(key) && (await isSecureStoreAvailable())) {
    const value = await SecureStore.getItemAsync(key);
    return value ?? fallback;
  }
  return getString(key, fallback);
}

export async function removeSecureString(key: string): Promise<void> {
  if (SECURE_KEYS.has(key) && (await isSecureStoreAvailable())) {
    await SecureStore.deleteItemAsync(key);
  } else {
    remove(key);
  }
}

export async function migrateToSecureStore(): Promise<void> {
  if (!(await isSecureStoreAvailable())) return;
  for (const key of SECURE_KEYS) {
    const existing = getString(key);
    if (existing) {
      const stored = await SecureStore.getItemAsync(key);
      if (!stored) {
        await SecureStore.setItemAsync(key, existing);
      }
      remove(key);
    }
  }
}
