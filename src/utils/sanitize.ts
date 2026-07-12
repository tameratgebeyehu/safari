const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_RE = /javascript\s*:/gi;
const WHITESPACE_RE = /\s+/g;

export function stripHtml(input: string): string {
  return input.replace(HTML_TAG_RE, '').replace(SCRIPT_RE, '').trim();
}

export function sanitizeDescription(input: string, maxLength = 100): string {
  const cleaned = stripHtml(input);
  return cleaned.slice(0, maxLength);
}

export function sanitizePhone(input: string): string {
  return input.replace(/[^\d+]/g, '');
}

export function sanitizeAmount(input: string): string {
  return input.replace(/\D/g, '');
}

export function sanitizeCustomerName(input: string, maxLength = 50): string {
  const cleaned = stripHtml(input).replace(WHITESPACE_RE, ' ');
  return cleaned.slice(0, maxLength);
}

export function sanitizeForLog(input: string): string {
  const phoneMasked = input.replace(/09\d{8}/g, '09XXXXXXXX');
  return stripHtml(phoneMasked).slice(0, 200);
}
