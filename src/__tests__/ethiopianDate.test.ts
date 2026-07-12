import { getEthiopianDateTime, formatDisplayDate, formatDisplayTime } from '../utils/ethiopianDate';

describe('getEthiopianDateTime', () => {
  it('converts a known Gregorian date to Ethiopian', () => {
    const date = new Date(2026, 6, 7);
    const eth = getEthiopianDateTime(date);
    expect(eth.ethiopianDate).toMatch(/^[A-Za-z]+, \d{1,2} [A-Za-z]+ \d{4}$/);
    expect(eth.isoTimestamp).toBe(date.toISOString());
  });

  it('returns correct time components in ethiopianTime', () => {
    const date = new Date(2026, 6, 7, 14, 30, 45);
    const eth = getEthiopianDateTime(date);
    expect(eth.ethiopianTime).toBe('14:30');
  });

  it('formats ethiopianDate string with day name, day, month, year', () => {
    const date = new Date(2026, 0, 1);
    const eth = getEthiopianDateTime(date);
    expect(eth.ethiopianDate).toMatch(/^[A-Za-z]+, \d{1,2} [A-Za-z]+ \d{4}$/);
  });

  it('returns ethiopianTime as HH:MM', () => {
    const date = new Date(2026, 6, 7, 8, 5);
    const eth = getEthiopianDateTime(date);
    expect(eth.ethiopianTime).toMatch(/^\d{2}:\d{2}$/);
  });

  it('returns isoTimestamp matching input', () => {
    const date = new Date('2026-07-07T10:00:00.000Z');
    const eth = getEthiopianDateTime(date);
    expect(eth.isoTimestamp).toBe(date.toISOString());
  });
});

describe('formatDisplayDate', () => {
  it('formats from ISO string', () => {
    const result = formatDisplayDate('2026-07-07T10:00:00.000Z');
    expect(result).toMatch(/^[A-Za-z]+, \d{1,2} [A-Za-z]+ \d{4}$/);
  });
});

describe('formatDisplayTime', () => {
  it('formats time from ISO string', () => {
    const result = formatDisplayTime('2026-07-07T10:00:00.000Z');
    expect(result).toMatch(/^\d{2}:\d{2}$/);
  });
});