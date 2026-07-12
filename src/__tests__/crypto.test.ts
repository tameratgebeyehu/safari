import { sha256, randomUUID, generateNonce, hashWithSecret, getRandomInt } from '../security/crypto';

describe('sha256', () => {
  it('returns a 64-char hex string', async () => {
    const hash = await sha256('hello');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic for same input', async () => {
    const a = await sha256('test');
    const b = await sha256('test');
    expect(a).toBe(b);
  });

  it('differs for different inputs', async () => {
    const a = await sha256('abc');
    const b = await sha256('xyz');
    expect(a).not.toBe(b);
  });
});

describe('randomUUID', () => {
  it('returns a UUID v4 format string', () => {
    const uuid = randomUUID();
    expect(uuid).toMatch(
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i,
    );
  });

  it('produces unique values', () => {
    const a = randomUUID();
    const b = randomUUID();
    expect(a).not.toBe(b);
  });
});

describe('generateNonce', () => {
  it('returns nonce (16 hex) and timestamp', async () => {
    const result = await generateNonce();
    expect(result.nonce).toMatch(/^[a-f0-9]{16}$/);
    expect(typeof result.timestamp).toBe('number');
  });
});

describe('hashWithSecret', () => {
  it('returns a 64-char hex string', async () => {
    const hash = await hashWithSecret('data', 'secret');
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('getRandomInt', () => {
  it('returns a number within range', () => {
    for (let i = 0; i < 100; i++) {
      const n = getRandomInt(1, 6);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    }
  });

  it('returns the min when min equals max', () => {
    expect(getRandomInt(5, 5)).toBe(5);
  });

  it('returns an integer', () => {
    for (let i = 0; i < 50; i++) {
      const n = getRandomInt(0, 100);
      expect(Number.isInteger(n)).toBe(true);
    }
  });
});
