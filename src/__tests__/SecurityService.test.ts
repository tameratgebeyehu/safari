import {
  validatePinStrength,
  isWeakPin,
  isSequentialPin,
  isRepeatingPin,
  getPinState,
  recordFailedAttempt,
  resetPinAttempts,
  hashPin,
  verifyPinHash,
} from '../services/SecurityService';

describe('isSequentialPin', () => {
  it('detects ascending sequential', () => {
    expect(isSequentialPin('0123')).toBe(true);
    expect(isSequentialPin('1234')).toBe(true);
    expect(isSequentialPin('4567')).toBe(true);
  });

  it('detects descending sequential', () => {
    expect(isSequentialPin('9876')).toBe(true);
  });

  it('rejects non-sequential', () => {
    expect(isSequentialPin('1392')).toBe(false);
  });
});

describe('isRepeatingPin', () => {
  it('detects all same digits', () => {
    expect(isRepeatingPin('0000')).toBe(true);
    expect(isRepeatingPin('1111')).toBe(true);
  });

  it('rejects non-repeating', () => {
    expect(isRepeatingPin('1234')).toBe(false);
  });
});

describe('isWeakPin', () => {
  it('flags sequential pins', () => {
    expect(isWeakPin('1234')).toBe(true);
    expect(isWeakPin('6789')).toBe(true);
  });

  it('flags repeating pins', () => {
    expect(isWeakPin('0000')).toBe(true);
    expect(isWeakPin('9999')).toBe(true);
  });

  it('passes strong pins', () => {
    expect(isWeakPin('1947')).toBe(false);
    expect(isWeakPin('7392')).toBe(false);
  });
});

describe('validatePinStrength', () => {
  it('rejects non-4-digit string', () => {
    expect(validatePinStrength('123')).toMatch(/exactly 4 digits/);
    expect(validatePinStrength('12345')).toMatch(/exactly 4 digits/);
    expect(validatePinStrength('abcd')).toMatch(/exactly 4 digits/);
  });

  it('rejects weak pins with user-friendly message', () => {
    expect(validatePinStrength('1234')).toMatch(/too easy/);
  });

  it('returns null for strong pin', () => {
    expect(validatePinStrength('7392')).toBeNull();
  });
});

describe('pin attempt tracking', () => {
  beforeEach(() => {
    resetPinAttempts();
  });

  it('starts with no lockout and full attempts', () => {
    const state = getPinState();
    expect(state.locked).toBe(false);
    expect(state.remainingAttempts).toBe(5);
    expect(state.lockoutEnd).toBeNull();
  });

  it('decrements remaining attempts on failure', () => {
    recordFailedAttempt();
    const state = getPinState();
    expect(state.remainingAttempts).toBe(4);
  });

  it('locks after 5 failed attempts', () => {
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt();
    }
    const state = getPinState();
    expect(state.locked).toBe(true);
    expect(state.remainingAttempts).toBe(0);
    expect(state.lockoutEnd).toBeGreaterThan(0);
  });

  it('resetPinAttempts clears lock state', () => {
    for (let i = 0; i < 5; i++) {
      recordFailedAttempt();
    }
    resetPinAttempts();
    const state = getPinState();
    expect(state.locked).toBe(false);
    expect(state.remainingAttempts).toBe(5);
  });
});

describe('hashPin / verifyPinHash', () => {
  it('produces salt:hash format', async () => {
    const hashed = await hashPin('7392');
    expect(hashed).toMatch(/^[a-f0-9]{8}:[a-f0-9]{64}$/);
  });

  it('verifies correct pin', async () => {
    const hashed = await hashPin('7392');
    const ok = await verifyPinHash('7392', hashed);
    expect(ok).toBe(true);
  });

  it('rejects wrong pin', async () => {
    const hashed = await hashPin('7392');
    const ok = await verifyPinHash('1234', hashed);
    expect(ok).toBe(false);
  });

  it('rejects malformed stored hash', async () => {
    const ok = await verifyPinHash('7392', 'invalid-hash');
    expect(ok).toBe(false);
  });
});
