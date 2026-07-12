/**
 * Ethiopian mobile number utilities.
 * Supports both Safaricom (07…) and Ethio Telecom (09…) prefixes.
 *
 * Safaricom Ethiopia:  070, 071, 072, 073, 074, 075, 076, 077, 078, 079
 * Ethio Telecom:       090, 091, 092, 093, 094, 095, 096, 097, 098, 099
 */

const ETHIOPIAN_MOBILE_REGEX = /^0[79]\d{8}$/;

export function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');

  // +251 7XXXXXXXX  or  +251 9XXXXXXXX  (international, 12 digits)
  if (digits.startsWith('251') && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  // 7XXXXXXXXX (9 digits, missing leading 0)
  if (digits.startsWith('7') && digits.length === 9) {
    return `0${digits}`;
  }

  // 9XXXXXXXXX (9 digits, missing leading 0)
  if (digits.startsWith('9') && digits.length === 9) {
    return `0${digits}`;
  }

  // Already 07XXXXXXXX or 09XXXXXXXX (10 digits)
  if ((digits.startsWith('07') || digits.startsWith('09')) && digits.length === 10) {
    return digits;
  }

  return digits;
}

export function isValidEthiopianPhone(input: string): boolean {
  const normalized = normalizePhoneNumber(input);
  return ETHIOPIAN_MOBILE_REGEX.test(normalized);
}

/**
 * Formats a phone number as: 07XX XXX XXX
 * e.g. "0712345678" → "0712 345 678"
 */
export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.length === 10) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
  }
  return phone;
}
