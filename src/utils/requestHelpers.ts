import type { RequestStatus } from '../constants';
import { colors } from '../theme/colors';

export function getStatusColor(status: RequestStatus): string {
  switch (status) {
    case 'Pending':
      return colors.pending;
    case 'Processing':
      return colors.processing;
    case 'Completed':
      return colors.completed;
    case 'Cancelled':
      return colors.cancelled;
    default:
      return colors.textSecondary;
  }
}

export function sortRequests<T extends { isoTimestamp: string; amount: number }>(
  items: T[],
  sortBy: string
): T[] {
  const sorted = [...items];
  switch (sortBy) {
    case 'oldest':
      return sorted.sort(
        (a, b) => new Date(a.isoTimestamp).getTime() - new Date(b.isoTimestamp).getTime()
      );
    case 'highestAmount':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'lowestAmount':
      return sorted.sort((a, b) => a.amount - b.amount);
    case 'newest':
    default:
      return sorted.sort(
        (a, b) => new Date(b.isoTimestamp).getTime() - new Date(a.isoTimestamp).getTime()
      );
  }
}

export function filterByStatus<T extends { status: RequestStatus }>(
  items: T[],
  status: RequestStatus | 'all'
): T[] {
  if (status === 'all') return items;
  return items.filter((item) => item.status === status);
}

export function searchRequests<T extends { buyerPhone: string; description: string; requestId: string }>(
  items: T[],
  query: string
): T[] {
  if (!query.trim()) return items;
  const lower = query.toLowerCase();
  return items.filter(
    (item) =>
      item.buyerPhone.includes(lower) ||
      item.description.toLowerCase().includes(lower) ||
      item.requestId.toLowerCase().includes(lower)
  );
}

export function groupByHistory<T extends { isoTimestamp: string }>(
  items: T[]
): Record<string, T[]> {
  const groups: Record<string, T[]> = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: [],
  };

  const now = new Date();
  const today = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  items.forEach((item) => {
    const date = new Date(item.isoTimestamp);
    const dateStr = date.toDateString();

    if (dateStr === today) {
      groups.today.push(item);
    } else if (dateStr === yesterdayStr) {
      groups.yesterday.push(item);
    } else if (date >= weekAgo) {
      groups.thisWeek.push(item);
    } else if (date >= monthAgo) {
      groups.thisMonth.push(item);
    } else {
      groups.older.push(item);
    }
  });

  return groups;
}
