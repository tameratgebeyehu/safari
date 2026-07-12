import { stripHtml, sanitizeDescription, sanitizePhone, sanitizeAmount, sanitizeCustomerName, sanitizeForLog } from '../utils/sanitize';

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>hello</p>')).toBe('hello');
  });

  it('removes script tags', () => {
    expect(stripHtml('click <a href="javascript:alert(1)">here</a>')).toBe('click here');
  });

  it('returns empty for only tags', () => {
    expect(stripHtml('<br/><hr/>')).toBe('');
  });

  it('handles plain text without tags', () => {
    expect(stripHtml('hello world')).toBe('hello world');
  });
});

describe('sanitizeDescription', () => {
  it('strips HTML and truncates', () => {
    expect(sanitizeDescription('<b>buy</b> groceries', 100)).toBe('buy groceries');
  });

  it('truncates to maxLength', () => {
    expect(sanitizeDescription('abcdefghij', 5)).toBe('abcde');
  });
});

describe('sanitizePhone', () => {
  it('keeps digits and plus', () => {
    expect(sanitizePhone('+251-91-234-5678')).toBe('+251912345678');
  });

  it('removes letters', () => {
    expect(sanitizePhone('09abc123xxx')).toBe('09123');
  });
});

describe('sanitizeAmount', () => {
  it('removes non-digits', () => {
    expect(sanitizeAmount('1,234.50')).toBe('123450');
  });

  it('keeps digits only', () => {
    expect(sanitizeAmount('5000')).toBe('5000');
  });

  it('handles empty string', () => {
    expect(sanitizeAmount('')).toBe('');
  });
});

describe('sanitizeCustomerName', () => {
  it('strips HTML and collapses whitespace', () => {
    expect(sanitizeCustomerName('  Abebe   <b>Kebede</b>  ', 50)).toBe('Abebe Kebede');
  });

  it('truncates to maxLength', () => {
    expect(sanitizeCustomerName('Almaz Worku Beyene', 10)).toBe('Almaz Work');
  });
});

describe('sanitizeForLog', () => {
  it('masks Ethiopian phone numbers', () => {
    expect(sanitizeForLog('user 0912345678 called')).toBe('user 09XXXXXXXX called');
  });

  it('strips HTML', () => {
    expect(sanitizeForLog('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('truncates beyond 200 chars', () => {
    const long = 'x'.repeat(300);
    expect(sanitizeForLog(long).length).toBe(200);
  });
});
