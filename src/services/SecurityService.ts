import { getNumber, setNumber, remove, StorageKeys } from '../storage/mmkv';
import { sha256, randomUUID } from '../security/crypto';

const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000;

export interface PinState {
  locked: boolean;
  remainingAttempts: number;
  lockoutEnd: number | null;
}

function getAttempts(): number {
  return getNumber(StorageKeys.PIN_ATTEMPTS, 0);
}

function setAttempts(count: number): void {
  setNumber(StorageKeys.PIN_ATTEMPTS, count);
}

function getLockoutEnd(): number {
  return getNumber(StorageKeys.PIN_LOCKOUT, 0);
}

function setLockoutEnd(timestamp: number): void {
  setNumber(StorageKeys.PIN_LOCKOUT, timestamp);
}

export function getPinState(): PinState {
  const lockoutEnd = getLockoutEnd();
  const now = Date.now();

  if (lockoutEnd > now) {
    return { locked: true, remainingAttempts: 0, lockoutEnd };
  }

  if (lockoutEnd > 0 && now >= lockoutEnd) {
    setLockoutEnd(0);
    setAttempts(0);
  }

  const attempts = getAttempts();
  return {
    locked: false,
    remainingAttempts: Math.max(0, MAX_PIN_ATTEMPTS - attempts),
    lockoutEnd: null,
  };
}

export function recordFailedAttempt(): PinState {
  const attempts = getAttempts() + 1;
  setAttempts(attempts);

  if (attempts >= MAX_PIN_ATTEMPTS) {
    const lockoutEnd = Date.now() + LOCKOUT_DURATION_MS;
    setLockoutEnd(lockoutEnd);
    return { locked: true, remainingAttempts: 0, lockoutEnd };
  }

  return { locked: false, remainingAttempts: MAX_PIN_ATTEMPTS - attempts, lockoutEnd: null };
}

export function resetPinAttempts(): void {
  remove(StorageKeys.PIN_ATTEMPTS);
  remove(StorageKeys.PIN_LOCKOUT);
}

export function isSequentialPin(pin: string): boolean {
  const seq = '0123456789';
  return seq.includes(pin) || seq.split('').reverse().join('').includes(pin);
}

export function isRepeatingPin(pin: string): boolean {
  return new Set(pin.split('')).size === 1;
}

export function isWeakPin(pin: string): boolean {
  return isSequentialPin(pin) || isRepeatingPin(pin) || pin === '1234' || pin === '0000';
}

export function validatePinStrength(pin: string): string | null {
  if (!/^\d{4}$/.test(pin)) {
    return 'PIN must be exactly 4 digits';
  }
  if (isWeakPin(pin)) {
    return 'This PIN is too easy to guess';
  }
  return null;
}

export async function hashPin(pin: string): Promise<string> {
  const salt = randomUUID().slice(0, 8);
  const hash = await sha256(salt + pin);
  return `${salt}:${hash}`;
}

export async function verifyPinHash(pin: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hash] = parts;
  const computed = await sha256(salt + pin);
  return computed === hash;
}
