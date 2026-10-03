import { formatDayMonth, formatDayShort, formatTime, parseLocal } from './format';

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const dayDiff = (a: Date, b: Date) =>
  Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86_400_000);

/** "19:42" today · "Yesterday" · "Sat 27 Sep" this week · "14 Sep" earlier (Overview alerts). */
export function relativeDay(iso: string, nowIso: string) {
  const d = parseLocal(iso);
  const diff = dayDiff(parseLocal(nowIso), d);
  if (diff === 0) return formatTime(d);
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return formatDayShort(d);
  return formatDayMonth(d);
}

/** Alerts page groups: Today · 30 Sep, Yesterday · 29 Sep, Earlier this week, then by month. */
export function alertGroup(iso: string, nowIso: string): { key: string; label: string } {
  const d = parseLocal(iso);
  const now = parseLocal(nowIso);
  const diff = dayDiff(now, d);
  if (diff === 0) return { key: 'today', label: `Today · ${formatDayMonth(d)}` };
  if (diff === 1) return { key: 'yesterday', label: `Yesterday · ${formatDayMonth(d)}` };
  if (diff < 7) return { key: 'week', label: 'Earlier this week' };
  const sameMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const month = d.toLocaleString('en-GB', { month: 'long', year: 'numeric' });
  return sameMonth
    ? { key: 'month', label: `Earlier in ${month.split(' ')[0]}` }
    : { key: `m-${d.getFullYear()}-${d.getMonth()}`, label: month };
}

/** Time shown inside an alert group: clock time for today/yesterday, short date otherwise. */
export function alertTime(iso: string, nowIso: string) {
  const d = parseLocal(iso);
  return dayDiff(parseLocal(nowIso), d) <= 1 ? formatTime(d) : formatDayShort(d);
}

/** "2 min ago" */
export function minutesAgo(iso: string, nowIso: string) {
  const m = Math.max(0, Math.round((parseLocal(nowIso).getTime() - parseLocal(iso).getTime()) / 60_000));
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return `${h} h ago`;
}
