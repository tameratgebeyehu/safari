import i18n from '../i18n';

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

// -----------------------------------------------------------------
// Correct Gregorian → Ethiopian conversion
// Based on the Zenysis/ethiopian-date algorithm (production-tested)
// -----------------------------------------------------------------
const _startDayOfEthiopian = (year: number): number => {
  const newYearDay = Math.floor(year / 100) - Math.floor(year / 400) - 4;
  return (year - 1) % 4 === 3 ? newYearDay + 1 : newYearDay;
};

function gregorianToEthiopian(
  year: number,
  month: number,
  date: number
): { year: number; month: number; day: number } {
  // Number of days in Gregorian months (Jan = 1)
  const gregorianMonths = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Number of days in Ethiopian months (Jan = 1)
  // Index 10 = Pagumen (5 or 6 days)
  const ethiopianMonths = [0, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5, 30, 30, 30, 30];

  // Gregorian leap year → Feb has 29 days
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    gregorianMonths[2] = 29;
  }

  // September sees 8-year difference
  let ethiopianYear = year - 8;

  // Ethiopian leap year → Pagumen has 6 days
  if (ethiopianYear % 4 === 3) {
    ethiopianMonths[10] = 6;
  }

  // Ethiopian new year day in Gregorian calendar
  const newYearDay = _startDayOfEthiopian(year - 8);

  // Count total Gregorian days up to the given date
  let until = 0;
  for (let i = 1; i < month; i++) {
    until += gregorianMonths[i]!;
  }
  until += date;

  // Compute tahissas offset (December alignment)
  let tahissas = ethiopianYear % 4 === 0 ? 26 : 25;

  if (year < 1582) {
    ethiopianMonths[1] = 0;
    ethiopianMonths[2] = tahissas;
  } else if (until <= 277 && year === 1582) {
    ethiopianMonths[1] = 0;
    ethiopianMonths[2] = tahissas;
  } else {
    tahissas = newYearDay - 3;
    ethiopianMonths[1] = tahissas;
  }

  // Find which Ethiopian month/day corresponds
  let m = 1;
  let ethiopianDate = 1;
  for (m = 1; m < ethiopianMonths.length; m++) {
    const daysInMonth = ethiopianMonths[m] ?? 0;
    if (until <= daysInMonth) {
      ethiopianDate =
        m === 1 || daysInMonth === 0 ? until + (30 - tahissas) : until;
      break;
    } else {
      until -= daysInMonth;
    }
  }

  // If m > 10, we're already in the next Ethiopian year
  if (m > 10) {
    ethiopianYear += 1;
  }

  // Ethiopian months ordered according to Gregorian index
  const order = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1, 2, 3, 4];
  const ethiopianMonth = order[m] ?? 1;

  return { year: ethiopianYear, month: ethiopianMonth, day: ethiopianDate };
}

export function getEthiopianDateTime(date: Date = new Date()): EthiopianDateTime {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const eth = gregorianToEthiopian(year, month, day);
  const monthName = ETHIOPIAN_MONTHS[eth.month - 1] ?? 'Unknown';
  const dayName = ETHIOPIAN_DAYS[date.getDay()] ?? '';

  // Use 12-hour Ethiopian clock (Habesha time: offset by 6 hours)
  const localHours = date.getHours();
  const localMinutes = date.getMinutes();

  // Convert to Ethiopian (Habesha) clock: 6 AM Gregorian = 12:00 Ethiopian
  let ethHour = (localHours + 18) % 12;
  if (ethHour === 0) ethHour = 12;
  
  const periodKey = localHours < 6 || localHours >= 18 ? 'time.night' : localHours < 12 ? 'time.morning' : 'time.afternoon';
  const period = i18n.isInitialized ? i18n.t(periodKey) : (localHours < 6 || localHours >= 18 ? 'ሌሊት' : localHours < 12 ? 'ጠዋት' : 'ከሰዓት');

  const hh = ethHour.toString().padStart(2, '0');
  const mm = localMinutes.toString().padStart(2, '0');

  return {
    ethiopianDate: `${dayName}, ${eth.day} ${monthName} ${eth.year}`,
    ethiopianTime: `${hh}:${mm} ${period}`,
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
