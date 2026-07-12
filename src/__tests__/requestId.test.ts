import { generateRequestId, generateFavoriteId } from '../utils/requestId';

describe('generateRequestId', () => {
  it('matches SA-YYYYMMDD-XXXXXXXX format', () => {
    const fixed = new Date(2026, 6, 7);
    const id = generateRequestId(fixed);
    expect(id).toMatch(/^SA-20260707-[A-F0-9]{8}$/);
  });

  it('uses current date by default', () => {
    const id = generateRequestId();
    expect(id).toMatch(/^SA-\d{8}-[A-F0-9]{8}$/);
  });

  it('produces unique IDs on consecutive calls', () => {
    const a = generateRequestId();
    const b = generateRequestId();
    expect(a).not.toBe(b);
  });

  it('produces unique IDs for same date with different random', () => {
    const d = new Date(2026, 0, 1);
    const a = generateRequestId(d);
    const b = generateRequestId(d);
    expect(a).not.toBe(b);
  });
});

describe('generateFavoriteId', () => {
  it('matches FAV-<timestamp>-XXXX format', () => {
    const id = generateFavoriteId();
    expect(id).toMatch(/^FAV-\d+-[A-F0-9]{4}$/);
  });

  it('produces unique IDs', () => {
    const a = generateFavoriteId();
    const b = generateFavoriteId();
    expect(a).not.toBe(b);
  });
});