import { randomUUID } from '../security/crypto';

export function generateRequestId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const suffix = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `SA-${year}${month}${day}-${suffix}`;
}

export function generateFavoriteId(): string {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase();
  return `FAV-${Date.now()}-${suffix}`;
}