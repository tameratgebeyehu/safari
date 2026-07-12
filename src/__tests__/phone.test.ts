import { isValidEthiopianPhone, normalizePhoneNumber, formatPhoneDisplay } from '../utils/phone';

describe('normalizePhoneNumber', () => {
  it('keeps 09XXXXXX99 as-is', () => {
    expect(normalizePhoneNumber('0912345678')).toBe('0912345678');
  });

  it('adds leading 0 for 9XXXXXXXX', () => {
    expect(normalizePhoneNumber('912345678')).toBe('0912345678');
  });

  it('strips +251 and adds 0', () => {
    expect(normalizePhoneNumber('+251912345678')).toBe('0912345678');
  });

  it('strips 251 without + and adds 0', () => {
    expect(normalizePhoneNumber('251912345678')).toBe('0912345678');
  });

  it('removes non-digit characters', () => {
    expect(normalizePhoneNumber('+251 91 234 5678')).toBe('0912345678');
  });

  it('returns raw digits for unrecognized format', () => {
    expect(normalizePhoneNumber('12345')).toBe('12345');
  });

  it('handles empty string', () => {
    expect(normalizePhoneNumber('')).toBe('');
  });
});

describe('isValidEthiopianPhone', () => {
  it('accepts 09XXXXXXXX', () => {
    expect(isValidEthiopianPhone('0912345678')).toBe(true);
  });

  it('accepts 09XXXXXXXX with spaces', () => {
    expect(isValidEthiopianPhone('09 1234 5678')).toBe(true);
  });

  it('accepts +251XXXXXXXXX', () => {
    expect(isValidEthiopianPhone('+251912345678')).toBe(true);
  });

  it('rejects landline 01XXXXXXXX', () => {
    expect(isValidEthiopianPhone('0111234567')).toBe(false);
  });

  it('rejects short number', () => {
    expect(isValidEthiopianPhone('091234')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEthiopianPhone('')).toBe(false);
  });

  it('accepts 07 prefix mobile', () => {
    expect(isValidEthiopianPhone('0712345678')).toBe(true);
  });

  it('rejects other prefixes', () => {
    expect(isValidEthiopianPhone('0512345678')).toBe(false);
  });
});

describe('formatPhoneDisplay', () => {
  it('formats 10-digit number as XXXX XXX XXXX', () => {
    expect(formatPhoneDisplay('0912345678')).toBe('0912 345 678');
  });

  it('normalizes and formats +251 number', () => {
    expect(formatPhoneDisplay('+251912345678')).toBe('0912 345 678');
  });

  it('returns raw input for non-10-digit after normalization', () => {
    expect(formatPhoneDisplay('123')).toBe('123');
  });
});
