const ETHIOPIAN_MOBILE_REGEX = /^(?:\+251|0)?9\d{8}$/;

export function normalizePhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');

  if (digits.startsWith('251') && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  if (digits.startsWith('9') && digits.length === 9) {
    return `0${digits}`;
  }

  if (digits.startsWith('09') && digits.length === 10) {
    return digits;
  }

  return digits;
}

export function isValidEthiopianPhone(input: string): boolean {
  const normalized = normalizePhoneNumber(input);
  return ETHIOPIAN_MOBILE_REGEX.test(normalized);
}

export function formatPhoneDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (normalized.length === 10) {
    return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
  }
  return phone;
}
