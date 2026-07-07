export function generateRequestId(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SA-${year}${month}${day}-${suffix}`;
}

export function generateFavoriteId(): string {
  return `FAV-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
