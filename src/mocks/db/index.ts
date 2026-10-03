/**
 * In-memory database for the mock API: generated readings + mutable alerts, recommendations and
 * settings. Pure functions over the dataset, so handlers stay thin and tests can call them directly.
 */
import type {
  Alert,
  AlertCounts,
  AlertStatus,
  History,
  HistoryRange,
  Hourly,
  Overview,
  Period,
  Property,
  Recommendation,
  SearchResults,
  Settings,
  ZoneRow,
  ZonesPage,
  ZoneStatus,
  ZoneType,
  ZoneTypeDetail,
} from '@/api/schemas';
import { GUEST_NIGHTS, PRICE, PROPERTY, TYPE_DESCRIPTION, ZONES } from './catalog';
import {
  days,
  DEMAND_NOW_KW,
  demand,
  hourShape,
  monthlyBefore,
  months,
  NOW,
  NOW_HOUR,
  TODAY,
  typicalFor,
  zoneDaily,
} from './generate';
import { seedAlerts, seedRecommendations, seedSettings } from './seed';

const MONTH_NAMES = [
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
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TYPE_NAMES: Record<ZoneType, string> = {
  climate: 'Climate (HVAC)',
  pool: 'Pool',
  rooms: 'Rooms',
  kitchen: 'Kitchen',
  common: 'Common areas',
};
const TYPES: ZoneType[] = ['climate', 'pool', 'rooms', 'kitchen', 'common'];

let state = { alerts: seedAlerts(), recommendations: seedRecommendations(), settings: seedSettings() };
export function resetDb() {
  state = { alerts: seedAlerts(), recommendations: seedRecommendations(), settings: seedSettings() };
}

const round = (v: number, d = 1) => +v.toFixed(d);
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const monthIndex = (m: string) => Number(m.slice(5, 7)) - 1;
const prevMonth = (m: string) => {
  const y = Number(m.slice(0, 4));
  const i = monthIndex(m);
  return i === 0 ? `${y - 1}-12` : `${y}-${String(i).padStart(2, '0')}`;
};
const minutesBefore = (iso: string, minutes: number) => {
  const d = new Date(`${iso}:00Z`);
  d.setUTCMinutes(d.getUTCMinutes() - minutes);
  return d.toISOString().slice(0, 16);
};

/* ── Periods ─────────────────────────────────────────────────────────────────────────── */
export function period(id: string): Period {
  const i = monthIndex(id);
  const name = MONTH_NAMES[i]!;
  return {
    id,
    label: `${name} ${id.slice(0, 4)}`,
    shortLabel: `${name.slice(0, 3)} ${id.slice(0, 4)}`,
    monthName: name,
    previousMonthName: MONTH_NAMES[(i + 11) % 12]!,
  };
}
export const periods = () => [...months].reverse().map(period);
export const isPeriod = (id: string) => (months as readonly string[]).includes(id);

/* ── Energy helpers ──────────────────────────────────────────────────────────────────── */
const daysIn = (m: string) => days.filter((d) => d.month === m);
export function zoneKwh(zoneId: string, month: string) {
  if (isPeriod(month)) return sum(daysIn(month).map((d) => zoneDaily[zoneId]![d.index]!));
  return monthlyBefore.find((x) => x.month === month)?.zone[zoneId] ?? 0;
}
const typeKwh = (type: ZoneType, month: string) =>
  sum(ZONES.filter((z) => z.type === type).map((z) => zoneKwh(z.id, month)));
const totalKwh = (month: string) => sum(ZONES.map((z) => zoneKwh(z.id, month)));
const price = (month: string) => PRICE[month] ?? 0.205;
const peakKw = (month: string) =>
  isPeriod(month) ? Math.max(...daysIn(month).flatMap((d) => demand[d.index]!)) : 46.1;
const guestNights = (month: string) => GUEST_NIGHTS[month] ?? 600;
const cost = (kwh: number, month: string) => round(kwh * price(month), 2);

/* ── Property ────────────────────────────────────────────────────────────────────────── */
export function property(): Property {
  return {
    ...PROPERTY,
    demandKw: DEMAND_NOW_KW,
    now: NOW,
    updatedAt: minutesBefore(NOW, 2),
    periods: periods(),
    newAlerts: state.alerts.filter((a) => a.status === 'new').length,
  };
}

/* ── Overview ────────────────────────────────────────────────────────────────────────── */
function dailyTotals(month: string) {
  return daysIn(month).map((d) => sum(ZONES.map((z) => zoneDaily[z.id]![d.index]!)));
}
/** 12 points for the KPI sparkline, ending with the latest day. */
function sparkline(raw: number[]) {
  const values = raw.map((_, i) => sum(raw.slice(Math.max(0, i - 6), i + 1)) / Math.min(7, i + 1));
  const n = 12;
  const step = values.length / n;
  return Array.from({ length: n }, (_, i) => {
    const slice = values.slice(Math.floor(i * step), Math.floor((i + 1) * step));
    return round(sum(slice) / Math.max(1, slice.length), 2);
  });
}

export function overview(periodId: string): Overview {
  const m = periodId;
  const p = prevMonth(m);
  const kwh = totalKwh(m);
  const prevKwh = totalKwh(p);
  const daily = dailyTotals(m);
  const peaks = daysIn(m).map((d) => Math.max(...demand[d.index]!));
  const byType = TYPES.map((t) => ({
    type: t,
    name: TYPE_NAMES[t],
    kwh: round(typeKwh(t, m), 0),
    share: typeKwh(t, m) / kwh,
  }));
  return {
    period: period(m),
    kpis: {
      consumption: { value: round(kwh, 0), previous: round(prevKwh, 0), trend: sparkline(daily) },
      cost: {
        value: cost(kwh, m),
        previous: cost(prevKwh, p),
        trend: sparkline(daily.map((v) => v * price(m))),
      },
      peakDemand: {
        value: round(Math.max(...peaks)),
        previous: round(peakKw(p), 2),
        trend: sparkline(peaks),
      },
      perGuestNight: {
        value: round(kwh / guestNights(m), 3),
        previous: round(prevKwh / guestNights(p), 3),
        trend: sparkline(daysIn(m).map((d, i) => daily[i]! / Math.max(4, d.guests))),
      },
    },
    byType,
    insight: insightFor(m),
    updatedAt: minutesBefore(NOW, 2),
  };
}

function insightFor(m: string) {
  if (m === '2026-09')
    return 'Climate fell 15% as nights cooled, but the pool rose 18% — its cover was left open on 4 nights.';
  const p = prevMonth(m);
  const changes = TYPES.map((t) => ({ t, c: (typeKwh(t, m) - typeKwh(t, p)) / typeKwh(t, p) })).sort(
    (a, b) => a.c - b.c,
  );
  const down = changes[0]!;
  const up = changes.at(-1)!;
  return `${TYPE_NAMES[down.t]} ${down.c < 0 ? 'fell' : 'rose'} ${Math.abs(Math.round(down.c * 100))}% and ${TYPE_NAMES[up.t].toLowerCase()} ${up.c < 0 ? 'fell' : 'rose'} ${Math.abs(Math.round(up.c * 100))}% compared with ${MONTH_NAMES[monthIndex(p)]}.`;
}

/* ── Hourly ──────────────────────────────────────────────────────────────────────────── */
export function lastDayOf(m: string) {
  return m === TODAY.slice(0, 7) ? TODAY : daysIn(m).at(-1)!.iso;
}

export function hourly(date: string): Hourly | null {
  const d = days.find((x) => x.iso === date);
  if (!d) return null;
  const typical = typicalFor(d.dow);
  return {
    date,
    weekday: WEEKDAYS[d.dow]!,
    contractedKw: state.settings.contract.contractedKw,
    points: typical.map((t, hour) => ({
      hour,
      kwh: date === TODAY && hour >= NOW_HOUR ? null : demand[d.index]![hour]!,
      typical: t,
    })),
  };
}

/* ── Zones ───────────────────────────────────────────────────────────────────────────── */
export interface ZoneQuery {
  period: string;
  q?: string;
  status?: ZoneStatus;
  type?: ZoneType;
  /** Change vs the previous month: up = consuming more, down = less. */
  trend?: 'up' | 'down';
  sort?: string; // "consumption.desc"
  page?: number;
  size?: number;
}

export function zoneRows(m: string): ZoneRow[] {
  const total = totalKwh(m);
  return ZONES.map((z) => {
    const kwh = zoneKwh(z.id, m);
    return {
      id: z.id,
      name: z.name,
      type: z.type,
      detail: z.detail,
      icon: z.icon,
      status: z.status,
      kwh: round(kwh, 0),
      previousKwh: round(zoneKwh(z.id, prevMonth(m)), 1),
      cost: cost(Math.round(kwh), m),
      share: kwh / total,
      meters: z.meters.length,
    };
  });
}

const STATUS_RANK: Record<ZoneStatus, number> = { normal: 0, attention: 1, alert: 2 };
const sorters: Record<string, (a: ZoneRow, b: ZoneRow) => number> = {
  zone: (a, b) => a.name.localeCompare(b.name),
  status: (a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status],
  consumption: (a, b) => a.kwh - b.kwh,
  change: (a, b) => (a.kwh - a.previousKwh) / a.previousKwh - (b.kwh - b.previousKwh) / b.previousKwh,
  cost: (a, b) => a.cost - b.cost,
  share: (a, b) => a.share - b.share,
};

export function zones({
  period: m,
  q,
  status,
  type,
  trend,
  sort = 'consumption.desc',
  page = 1,
  size = 10,
}: ZoneQuery): ZonesPage {
  let rows = zoneRows(m);
  if (q) {
    const needle = q.trim().toLowerCase();
    rows = rows.filter((r) => `${r.name} ${r.detail}`.toLowerCase().includes(needle));
  }
  if (status) rows = rows.filter((r) => r.status === status);
  if (type) rows = rows.filter((r) => r.type === type);
  if (trend) rows = rows.filter((r) => (trend === 'up' ? r.kwh > r.previousKwh : r.kwh < r.previousKwh));
  const [key = 'consumption', dir = 'desc'] = sort.split('.');
  const by = sorters[key] ?? sorters.consumption!;
  rows.sort((a, b) => (dir === 'asc' ? by(a, b) : by(b, a)));
  const total = rows.length;
  const start = (page - 1) * size;
  return {
    items: rows.slice(start, start + size),
    total,
    page,
    size,
    summary: { zones: ZONES.length, meters: sum(ZONES.map((z) => z.meters.length)) },
  };
}

const worst = (ss: ZoneStatus[]) =>
  ss.reduce((a, s) => (STATUS_RANK[s] > STATUS_RANK[a] ? s : a), 'normal' as ZoneStatus);

export function zoneType(type: ZoneType, m: string): ZoneTypeDetail {
  const members = ZONES.filter((z) => z.type === type);
  const kwh = typeKwh(type, m);
  const prevKwh = typeKwh(type, prevMonth(m));
  const md = daysIn(m);
  const daily = md.map((d) => ({ d, kwh: sum(members.map((z) => zoneDaily[z.id]![d.index]!)) }));
  const peak = daily.reduce((a, x) => (x.kwh > a.kwh ? x : a));
  const shares = TYPES.map((t) => typeKwh(t, m)).sort((a, b) => b - a);
  const rank = shares.indexOf(kwh) + 1;
  const meterCount = sum(members.map((z) => z.meters.length));
  let lag = 0;
  return {
    type,
    name: TYPE_NAMES[type],
    status: worst(members.map((z) => z.status)),
    description: `${members.length} sub-zone${members.length === 1 ? '' : 's'} · ${meterCount} meter${meterCount === 1 ? '' : 's'} · ${TYPE_DESCRIPTION[type]}`,
    kwh: round(kwh, 0),
    previousKwh: round(prevKwh, 1),
    cost: cost(Math.round(kwh), m),
    previousCost: cost(prevKwh, prevMonth(m)),
    peakDay: {
      date: peak.d.iso,
      kwh: round(peak.kwh, 0),
      note:
        type === 'climate'
          ? `heat wave, ${Math.round(peak.d.tmax)} °C`
          : type === 'pool' && peak.d.coverOpen
            ? 'cover left open overnight'
            : `${peak.d.occupied} of 14 rooms occupied`,
    },
    share: kwh / totalKwh(m),
    shareNote:
      rank === 1
        ? 'Largest zone at El Olivar'
        : `${['', 'Largest', 'Second', 'Third', 'Fourth', 'Fifth'][rank]} of 5 zone types`,
    subZones: members.map((z) => ({
      id: z.id,
      name: z.subName,
      status: z.status,
      kwh: round(zoneKwh(z.id, m), 0),
      share: zoneKwh(z.id, m) / kwh,
    })),
    meters: members.flatMap((z) =>
      z.meters.map((mt) => ({
        id: `${z.id}-${mt.code}`,
        code: mt.code,
        name: mt.name,
        zoneId: z.id,
        online: true,
        lastSeen: minutesBefore(NOW, 1 + (lag++ % 3 === 2 ? 2 : 0)),
      })),
    ),
  };
}

/* ── History ─────────────────────────────────────────────────────────────────────────── */
const dayLabel = (iso: string) =>
  `${Number(iso.slice(8, 10))} ${MONTH_NAMES[monthIndex(iso.slice(0, 7))]!.slice(0, 3)}`;
const dayLong = (iso: string) => {
  const d = days.find((x) => x.iso === iso);
  return `${WEEKDAYS[d?.dow ?? 0]!.slice(0, 3)} ${dayLabel(iso)}`;
};

export function history(type: ZoneType, range: HistoryRange, m: string): History {
  const members = ZONES.filter((z) => z.type === type);
  const typeDay = (i: number) => sum(members.map((z) => zoneDaily[z.id]![i]!));
  const name = TYPE_NAMES[type];
  const end = days.find((d) => d.iso === lastDayOf(m))!;

  if (range === '30d') {
    const md = daysIn(m);
    const prev = daysIn(prevMonth(m));
    const points = md.map((d) => {
      const p = prev.find((x) => x.dom === d.dom);
      return {
        key: d.iso,
        label: dayLabel(d.iso),
        longLabel: dayLong(d.iso),
        value: round(typeDay(d.index)),
        previous: p ? round(typeDay(p.index)) : null,
      };
    });
    const ticks = [1, 8, 15, 22, md.length].map((dom) => md[dom - 1]!.iso);
    return {
      range,
      seriesLabel: `${name} · ${period(m).monthName}`,
      previousLabel: period(m).previousMonthName,
      points,
      ticks,
    };
  }

  if (range === '7d') {
    const span = days.slice(end.index - 6, end.index + 1);
    const points = span.map((d) => ({
      key: d.iso,
      label: `${WEEKDAYS[d.dow]!.slice(0, 3)} ${d.dom}`,
      longLabel: dayLong(d.iso),
      value: round(typeDay(d.index)),
      previous: d.index >= 7 ? round(typeDay(d.index - 7)) : null,
    }));
    return {
      range,
      seriesLabel: `${name} · last 7 days`,
      previousLabel: 'Previous 7 days',
      points,
      ticks: points.map((p) => p.key),
    };
  }

  if (range === '24h') {
    const hourOf = (i: number, h: number) =>
      sum(members.map((z) => zoneDaily[z.id]![i]! * hourShape[z.driver][h]!));
    const points = Array.from({ length: 24 }, (_, h) => ({
      key: String(h).padStart(2, '0'),
      label: String(h).padStart(2, '0'),
      longLabel: `${dayLong(end.iso)} · ${String(h).padStart(2, '0')}:00`,
      value: end.iso === TODAY && h >= NOW_HOUR ? null : round(hourOf(end.index, h), 2),
      previous: end.index >= 7 ? round(hourOf(end.index - 7, h), 2) : null,
    }));
    return {
      range,
      seriesLabel: `${name} · ${end.iso === TODAY ? 'today' : dayLabel(end.iso)}`,
      previousLabel: 'Same day last week',
      points,
      ticks: ['00', '06', '12', '18', '23'],
    };
  }

  // 12m — Oct 2025 … the selected month
  const all = [...monthlyBefore.map((x) => x.month), ...months];
  const upto = all.slice(0, all.indexOf(m) + 1).slice(-12);
  const points = upto.map((mm, i) => {
    const value = sum(members.map((z) => zoneKwh(z.id, mm)));
    return {
      key: mm,
      label: MONTH_NAMES[monthIndex(mm)]!.slice(0, 3),
      longLabel: `${MONTH_NAMES[monthIndex(mm)]} ${mm.slice(0, 4)}`,
      value: round(value, 0),
      previous: round(value * (1.02 + 0.05 * Math.sin(i * 1.7)), 0),
    };
  });
  return {
    range,
    seriesLabel: `${name} · last 12 months`,
    previousLabel: 'Previous 12 months',
    points,
    ticks: points.filter((_, i) => i % 3 === 0 || i === points.length - 1).map((p) => p.key),
  };
}

/* ── Alerts ──────────────────────────────────────────────────────────────────────────── */
export interface AlertQuery {
  period: string;
  status?: AlertStatus;
  zone?: ZoneType;
  severity?: Alert['severity'];
  cursor?: number;
  limit?: number;
}

export function alerts({ period: m, status, zone, severity, cursor = 0, limit = 7 }: AlertQuery) {
  const endIso = `${lastDayOf(m)}T23:59`;
  const inScope = state.alerts
    .filter((a) => a.at <= endIso)
    .filter((a) => (!zone || a.zoneType === zone) && (!severity || a.severity === severity))
    .sort((a, b) => b.at.localeCompare(a.at));
  const monthItems = inScope.filter((a) => a.at.startsWith(m));
  const counts: AlertCounts = {
    all: monthItems.length,
    new: monthItems.filter((a) => a.status === 'new').length,
    reviewed: monthItems.filter((a) => a.status === 'reviewed').length,
    resolved: monthItems.filter((a) => a.status === 'resolved').length,
  };
  const list = status ? inScope.filter((a) => a.status === status) : inScope;
  const items = list.slice(cursor, cursor + limit);
  const next = cursor + limit < list.length ? String(cursor + limit) : null;
  return { items, nextCursor: next, counts };
}

export function setAlertStatus(ids: string[], status: AlertStatus) {
  const changed: Alert[] = [];
  state.alerts = state.alerts.map((a) => {
    if (!ids.includes(a.id)) return a;
    const next = { ...a, status };
    changed.push(next);
    return next;
  });
  return changed;
}

/* ── Recommendations ─────────────────────────────────────────────────────────────────── */
export function recommendations(type?: ZoneType): Recommendation[] {
  return state.recommendations
    .filter((r) => r.status !== 'dismissed' && (!type || r.zoneType === type))
    .sort((a, b) => a.priority - b.priority)
    .map(({ priority: _p, ...r }) => r);
}

export function updateRecommendation(id: string, action: 'apply' | 'dismiss' | 'undo') {
  const rec = state.recommendations.find((r) => r.id === id);
  if (!rec) return null;
  if (action === 'apply') Object.assign(rec, { status: 'applied', appliedAt: NOW });
  if (action === 'dismiss') Object.assign(rec, { status: 'dismissed' });
  if (action === 'undo') Object.assign(rec, { status: 'open', appliedAt: null });
  const { priority: _p, ...out } = rec;
  return out;
}

/* ── Settings ────────────────────────────────────────────────────────────────────────── */
export const settings = () => state.settings;
export function saveSettings(next: Settings) {
  state.settings = next;
  return next;
}

/* ── Search ──────────────────────────────────────────────────────────────────────────── */
export function search(q: string): SearchResults {
  const needle = q.trim().toLowerCase();
  if (!needle) return { zones: [], meters: [], alerts: [] };
  const has = (s: string) => s.toLowerCase().includes(needle);
  return {
    zones: ZONES.filter((z) => has(z.name) || has(z.detail))
      .slice(0, 5)
      .map((z) => ({ id: z.id, name: z.name, type: z.type, detail: z.detail })),
    meters: ZONES.flatMap((z) => z.meters.map((mt) => ({ ...mt, type: z.type, zone: z.name })))
      .filter((mt) => has(mt.code) || has(mt.name))
      .slice(0, 5)
      .map((mt) => ({ id: `${mt.code}`, code: mt.code, name: `${mt.name} · ${mt.zone}`, type: mt.type })),
    alerts: state.alerts
      .filter((a) => has(a.title) || has(a.meta))
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 5)
      .map((a) => ({ id: a.id, title: a.title, meta: a.meta, status: a.status })),
  };
}
