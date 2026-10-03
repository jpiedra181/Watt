/**
 * Formatting helpers. Watt's copy is English with en-US digit grouping ("4,812 kWh", "1,032.75 €"),
 * dates are written day-first ("Tue 30 Sep") like the Figma screens.
 */
const grouped = (decimals: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const cache = new Map<number, Intl.NumberFormat>();
export function formatNumber(value: number, decimals = 0) {
  let f = cache.get(decimals);
  if (!f) {
    f = grouped(decimals);
    cache.set(decimals, f);
  }
  return f.format(value);
}

/** 4812 → "4,812" · 52.4 → "52.4" (one decimal below 100 kWh unless told otherwise). */
export function formatKwh(value: number, decimals?: number) {
  return formatNumber(value, decimals ?? (Math.abs(value) < 100 && !Number.isInteger(value) ? 1 : 0));
}

export function formatEuro(value: number, decimals = 2) {
  return formatNumber(value, decimals);
}

/** Absolute percentage with one decimal: 0.061 → "6.1%". */
export function formatPercent(ratio: number, decimals = 1) {
  return `${formatNumber(Math.abs(ratio) * 100, decimals)}%`;
}

/** Share of a total, no decimals: 0.34 → "34%". */
export function formatShare(ratio: number) {
  return `${Math.round(ratio * 100)}%`;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const pad = (n: number) => String(n).padStart(2, '0');

/** All dates are wall-clock times at the property (Europe/Madrid); the mock API sends local ISO strings. */
export function parseLocal(iso: string) {
  const [d, t = '00:00'] = iso.split('T');
  const [y, m, day] = d!.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);
  return new Date(y!, m! - 1, day, hh, mm);
}

/**
 * The Figma screens label 30 Sep 2026 as a Tuesday (and 27 Sep as a Saturday), one day off the real
 * 2026 calendar. The demo follows the design, so every weekday is computed here, in one place.
 */
export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;
export const weekdayLong = (d: Date) => WEEKDAYS[weekdayIndex(d)]!;
export const weekdayShort = (d: Date) => WEEKDAYS[weekdayIndex(d)]!.slice(0, 3);
export const monthLong = (monthIndex: number) => MONTHS[monthIndex]!;
export const monthShort = (monthIndex: number) => MONTHS[monthIndex]!.slice(0, 3);

/** "Tuesday, 30 September" */
export const formatDayLong = (d: Date) => `${weekdayLong(d)}, ${d.getDate()} ${monthLong(d.getMonth())}`;
/** "Tue 30 Sep" */
export const formatDayShort = (d: Date) => `${weekdayShort(d)} ${d.getDate()} ${monthShort(d.getMonth())}`;
/** "30 Sep" */
export const formatDayMonth = (d: Date) => `${d.getDate()} ${monthShort(d.getMonth())}`;
/** "19:42" */
export const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
/** "September 2026" */
export const formatMonthYear = (year: number, monthIndex: number) => `${monthLong(monthIndex)} ${year}`;
/** "Sep 2026" */
export const formatMonthYearShort = (year: number, monthIndex: number) => `${monthShort(monthIndex)} ${year}`;
export const formatHour = (h: number) => pad(h);
