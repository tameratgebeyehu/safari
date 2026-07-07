export const QUICK_AMOUNTS = [5, 10, 15, 25, 50, 100] as const;

export const DEFAULT_PIN = '1234';

export const MAX_DESCRIPTION_LENGTH = 100;

export const APP_VERSION = '1.0.0';

export const DEVELOPER_NAME = 'TAMERAT GEBEYEHU';

export const REQUEST_STATUSES = [
  'Pending',
  'Processing',
  'Completed',
  'Cancelled',
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const USER_MODES = ['sender', 'receiver'] as const;

export type UserMode = (typeof USER_MODES)[number];

export const THEMES = ['light', 'dark', 'system'] as const;

export type ThemePreference = (typeof THEMES)[number];

export const LANGUAGES = ['en', 'am'] as const;

export type Language = (typeof LANGUAGES)[number];

export const HISTORY_GROUPS = [
  'today',
  'yesterday',
  'thisWeek',
  'thisMonth',
  'older',
] as const;

export type HistoryGroup = (typeof HISTORY_GROUPS)[number];

export const SORT_OPTIONS = [
  'newest',
  'oldest',
  'highestAmount',
  'lowestAmount',
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number];
