const ETHIOPIAN_MONTHS = [
  'Meskerem',
  'Tikimt',
  'Hidar',
  'Tahsas',
  'Tir',
  'Yekatit',
  'Megabit',
  'Miazia',
  'Ginbot',
  'Sene',
  'Hamle',
  'Nehase',
  'Pagumen',
];

const ETHIOPIAN_DAYS = [
  'Ehud',
  'Segno',
  'Maksegno',
  'Rebue',
  'Hamus',
  'Arb',
  'Kidame',
];

export interface EthiopianDateTime {
  ethiopianDate: string;
  ethiopianTime: string;
  isoTimestamp: string;
}

function gregorianToEthiopian(year: number, month: number, day: number) {
  const jd =
    Math.floor((1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4) +
    Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
    Math.floor(
      (3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4
    ) +
    day -
    32075;

  const r = (jd - 1723856) % 1461;
  const n = Math.floor(r / 365) + Math.floor(r / 1460);
  const ethYear = 4 * Math.floor((jd - 1723856) / 1461) + n + (n < 0 ? 0 : 1);
  const ethDayOfYear = jd - (1723856 + 365 * (ethYear - 1) + Math.floor((ethYear - 1) / 4));
  const ethMonth = Math.floor(ethDayOfYear / 30) + 1;
  const ethDay = (ethDayOfYear % 30) + 1;

  return { year: ethYear, month: ethMonth, day: ethDay };
}

export function getEthiopianDateTime(date: Date = new Date()): EthiopianDateTime {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const eth = gregorianToEthiopian(year, month, day);
  const monthName = ETHIOPIAN_MONTHS[eth.month - 1] ?? 'Unknown';
  const dayName = ETHIOPIAN_DAYS[date.getDay()] ?? '';

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return {
    ethiopianDate: `${dayName}, ${eth.day} ${monthName} ${eth.year}`,
    ethiopianTime: `${hours}:${minutes}`,
    isoTimestamp: date.toISOString(),
  };
}

export function formatDisplayDate(isoTimestamp: string): string {
  return getEthiopianDateTime(new Date(isoTimestamp)).ethiopianDate;
}

export function formatDisplayTime(isoTimestamp: string): string {
  return getEthiopianDateTime(new Date(isoTimestamp)).ethiopianTime;
}

export function isToday(isoTimestamp: string): boolean {
  const today = new Date();
  const date = new Date(isoTimestamp);
  return (
    today.getFullYear() === date.getFullYear() &&
    today.getMonth() === date.getMonth() &&
    today.getDate() === date.getDate()
  );
}

export function isYesterday(isoTimestamp: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const date = new Date(isoTimestamp);
  return (
    yesterday.getFullYear() === date.getFullYear() &&
    yesterday.getMonth() === date.getMonth() &&
    yesterday.getDate() === date.getDate()
  );
}

export function isThisWeek(isoTimestamp: string): boolean {
  const now = new Date();
  const date = new Date(isoTimestamp);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  return date >= startOfWeek && !isToday(isoTimestamp) && !isYesterday(isoTimestamp);
}

export function isThisMonth(isoTimestamp: string): boolean {
  const now = new Date();
  const date = new Date(isoTimestamp);
  return (
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    !isToday(isoTimestamp) &&
    !isYesterday(isoTimestamp) &&
    !isThisWeek(isoTimestamp)
  );
}

export function getHistoryGroup(isoTimestamp: string): string {
  if (isToday(isoTimestamp)) return 'today';
  if (isYesterday(isoTimestamp)) return 'yesterday';
  if (isThisWeek(isoTimestamp)) return 'thisWeek';
  if (isThisMonth(isoTimestamp)) return 'thisMonth';
  return 'older';
}
