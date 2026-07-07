import { DEFAULT_PIN } from '../constants';
import { getString, setString, StorageKeys } from '../storage/mmkv';

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h${Math.abs(hash)}`;
}

export function initializePin(): void {
  const existing = getString(StorageKeys.PIN_HASH);
  if (!existing) {
    setString(StorageKeys.PIN_HASH, simpleHash(DEFAULT_PIN));
  }
}

export function verifyPin(pin: string): boolean {
  initializePin();
  const stored = getString(StorageKeys.PIN_HASH);
  return stored === simpleHash(pin);
}

export function changePin(currentPin: string, newPin: string): boolean {
  if (!verifyPin(currentPin)) {
    return false;
  }
  if (!/^\d{4}$/.test(newPin)) {
    return false;
  }
  setString(StorageKeys.PIN_HASH, simpleHash(newPin));
  return true;
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}
