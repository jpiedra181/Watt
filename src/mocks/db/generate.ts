/**
 * Deterministic 3-month dataset (1 Jul – 30 Sep 2026) for Casa Rural El Olivar.
 *
 * - Daily kWh per zone comes from simple physical drivers (outdoor temperature, occupancy,
 *   pool-cover incidents, night length) plus noise, then every zone is scaled so its monthly total
 *   matches the Figma screens (September) and the "vs August" change in the Zones table.
 * - Property demand (kW) per hour follows the typical weekday curve drawn in the Figma hourly chart,
 *   scaled by weekday, heat and occupancy. 30 Sep (the demo "today") is exactly the Figma chart.
 * - Months before July only exist as monthly totals, for the 12-month history range.
 */
import { GUEST_NIGHTS, ZONES, type ZoneSpec } from './catalog';

export const TODAY = '2026-09-30';
/** Demo clock: Tuesday 30 September 2026, 22:14 at the property. */
export const NOW = '2026-09-30T22:14';
export const NOW_HOUR = 22;
export const DEMAND_NOW_KW = 38.2;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260930);
const jitter = (amp: number) => 1 + (rand() * 2 - 1) * amp;

export interface Day {
  index: number;
  iso: string; // 2026-09-14
  month: string; // 2026-09
  dom: number;
  dow: number; // 0 = Sunday
  tmax: number;
  tmin: number;
  occupied: number; // rooms occupied that night (0–14)
  guests: number;
  coverOpen: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');
const isoOf = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/* ── Weather ───────────────────────────────────────────────────────────────────────────────
 * Climate (HVAC) daily kWh in the Figma history chart (September, solid) and August (dashed).
 * Max temperature is derived from them so the cooling load reproduces the drawn curve:
 * kWh ≈ 20 + 4 × (Tmax − 20)  →  74 kWh on 14 Sep = heat wave, 34 °C.                      */
const SEP_CLIMATE = [
  47, 51, 49, 54, 57, 60, 56, 53, 51, 55, 60, 64, 66, 74, 68, 62, 59, 57, 55, 53, 50, 49, 48, 46, 51, 54, 52,
  49, 47, 45,
];
const AUG_CLIMATE = [
  62, 64, 63, 66, 68, 70, 69, 67, 65, 66, 68, 70, 71, 72, 70, 68, 66, 65, 64, 62, 61, 60, 62, 63, 64, 62, 61,
  60, 59, 58, 58,
];
const tmaxFrom = (kwh: number) => +(20 + (kwh - 20) / 4).toFixed(1);

/** Nights the pool cover stayed open (Overview insight: "left open on 4 nights"). */
const COVER_OPEN = new Set(['2026-09-08', '2026-09-16', '2026-09-22', '2026-09-29', '2026-08-19']);

export const days: Day[] = [];
{
  const start = new Date(2026, 6, 1);
  let julTemp = 31.5;
  for (let i = 0; i < 92; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const month = d.getMonth() + 1;
    const dom = d.getDate();
    const dow = (d.getDay() + 6) % 7; // Figma's calendar: 30 Sep 2026 is a Tuesday (see lib/format)
    let tmax: number;
    if (month === 9) tmax = tmaxFrom(SEP_CLIMATE[dom - 1]!);
    else if (month === 8) tmax = tmaxFrom(AUG_CLIMATE[dom - 1]!);
    else {
      julTemp = Math.min(35, Math.max(29, julTemp + (rand() - 0.5) * 1.6));
      tmax = +julTemp.toFixed(1);
    }
    const weekend = dow === 5 || dow === 6;
    const base =
      month === 9
        ? weekend
          ? 13
          : dow === 0
            ? 9
            : 7.5
        : month === 8
          ? weekend
            ? 14
            : 12.5
          : weekend
            ? 14
            : 12;
    const occupied = Math.max(3, Math.min(14, Math.round(base + (rand() - 0.5) * 3)));
    days.push({
      index: i,
      iso: isoOf(d),
      month: `2026-${pad(month)}`,
      dom,
      dow,
      tmax,
      tmin: +(tmax - 13 + (rand() - 0.5) * 2).toFixed(1),
      occupied,
      guests: occupied * 1.9,
      coverOpen: COVER_OPEN.has(isoOf(d)),
    });
  }
  // Guest nights per month match the "per guest night" KPI.
  for (const month of Object.keys(GUEST_NIGHTS)) {
    const md = days.filter((d) => d.month === month);
    const sum = md.reduce((s, d) => s + d.guests, 0);
    for (const d of md) d.guests = (d.guests * GUEST_NIGHTS[month]!) / sum;
  }
}

export const dayIndex = new Map(days.map((d) => [d.iso, d.index]));
export const months = ['2026-07', '2026-08', '2026-09'] as const;

/* ── Daily energy per zone ─────────────────────────────────────────────────────────────── */
function rawDaily(z: ZoneSpec, d: Day) {
  const occ = d.occupied / 14;
  switch (z.driver) {
    case 'cooling':
      return (20 + 4 * (d.tmax - 20)) * jitter(0.008);
    case 'pool':
      return (18 + 1.3 * Math.max(0, 24 - d.tmin) + (d.coverOpen ? 26 : 0)) * jitter(0.05);
    case 'kitchen':
      return (11 + 9 * occ + (d.dow === 6 || d.dow === 0 ? 3 : 0)) * jitter(0.08);
    case 'occupancy':
      return (3 + 14 * occ) * jitter(0.1);
    case 'constant':
      return 8.4 * jitter(0.03);
    case 'night': {
      // Night length grows through September; in August the garden timer was stuck on.
      const nightHours = d.month === '2026-07' ? 9.4 : d.month === '2026-08' ? 20 : 10.2 + (d.dom / 30) * 1.2;
      return nightHours * 0.48 * jitter(0.04);
    }
  }
}

/** July relative to August by zone type (hotter July, a few more guests, less pool heating). */
const JULY_VS_AUG: Record<ZoneSpec['type'], number> = {
  climate: 1.04,
  pool: 0.93,
  rooms: 1.03,
  kitchen: 1.05,
  common: 0.98,
};

export const zoneDaily: Record<string, number[]> = {};
for (const z of ZONES) {
  const raw = days.map((d) => rawDaily(z, d));
  const target: Record<string, number> = {
    '2026-09': z.sep,
    '2026-08': z.sep / (1 + z.vsAug),
  };
  target['2026-07'] = z.id === 'exterior-lighting' ? 150 : target['2026-08']! * JULY_VS_AUG[z.type];
  const out = raw.slice();
  for (const m of months) {
    const idx = days.filter((d) => d.month === m).map((d) => d.index);
    const sum = idx.reduce((s, i) => s + raw[i]!, 0);
    for (const i of idx) out[i] = (raw[i]! * target[m]!) / sum;
  }
  zoneDaily[z.id] = out;
}

/* ── Hourly shapes (share of a zone's day per hour) ────────────────────────────────────── */
const curve = (pts: number[]) => {
  const s = pts.reduce((a, b) => a + b, 0);
  return pts.map((p) => p / s);
};
export const hourShape: Record<ZoneSpec['driver'], number[]> = {
  cooling: curve([
    2, 2, 1.8, 1.8, 1.8, 2, 2.4, 3, 3.6, 4.2, 5, 5.8, 6.6, 7.4, 8, 8.2, 8, 7.4, 6.6, 5.6, 4.6, 3.8, 3, 2.4,
  ]),
  pool: curve([
    7, 7.4, 7.6, 7.6, 7.4, 7, 6, 3, 2, 1.6, 1.4, 1.2, 1.2, 1.2, 1.2, 1.4, 1.6, 2, 2.6, 3.4, 4.4, 5.4, 6.2,
    6.8,
  ]),
  kitchen: curve([
    1.6, 1.4, 1.4, 1.4, 1.4, 1.6, 3, 6, 7, 6, 3.4, 3, 5.6, 7, 6, 3, 2.6, 3, 5, 7.4, 8, 6.4, 3.4, 2,
  ]),
  occupancy: curve([
    3, 2.4, 2, 2, 2, 2.2, 3, 5.6, 6.4, 5, 3.2, 2.4, 2.2, 2.2, 2.2, 2.4, 3, 4, 5, 6, 6.6, 6.8, 6, 4.4,
  ]),
  constant: curve([2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 2, 2, 2, 2]),
  night: curve([
    6, 6, 6, 6, 6, 6, 4, 0.6, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 1.6, 4.4, 6, 6, 6,
  ]),
};

/* ── Property demand per hour (kW) ─────────────────────────────────────────────────────── */
/** Typical Tuesday drawn in the Figma hourly chart (average kW per hour). */
export const TYPICAL_WEEKDAY = [
  13, 12, 11, 11, 12, 14, 20, 28, 32, 27, 23, 22, 25, 30, 27, 24, 25, 30, 34, 38.1, 36, 30, 24, 18,
];
/** Today in the Figma hourly chart, 00:00–21:00 (22:00 is still running). */
const TODAY_DEMAND = [
  14.1, 12, 11.1, 11.1, 12, 15, 21.9, 30.9, 33, 29.1, 24, 23.1, 27, 33.9, 30, 26.1, 27, 33, 39, 52.4, 41.1,
  33.9,
];
const WEEKDAY_FACTOR = [1.1, 0.96, 1, 1, 1.01, 1.08, 1.14]; // Sun … Sat

export const typicalFor = (dow: number) => TYPICAL_WEEKDAY.map((v) => +(v * WEEKDAY_FACTOR[dow]!).toFixed(1));

export const demand: number[][] = days.map((d) => {
  if (d.iso === TODAY) return TODAY_DEMAND.slice();
  const heat = 1 + 0.018 * (d.tmax - 29);
  const occ = 0.86 + 0.14 * (d.occupied / 14);
  return typicalFor(d.dow).map((v) => +(v * heat * occ * jitter(0.07)).toFixed(1));
});
{
  // Monthly peaks: Sep 52.4 kW (today 19:00), Aug 47.7 (+9.8% → Sep), Jul 48.9.
  const PEAK: Record<string, number> = { '2026-07': 48.9, '2026-08': 47.72, '2026-09': 52.4 };
  for (const m of months) {
    const md = days.filter((d) => d.month === m && d.iso !== TODAY);
    const cap = m === '2026-09' ? 46.8 : PEAK[m]! - 0.6;
    for (const d of md) demand[d.index] = demand[d.index]!.map((v) => Math.min(v, cap));
    if (m !== '2026-09') {
      // The hottest evening of the month sets the peak.
      const hottest = md.reduce((a, d) => (d.tmax > a.tmax ? d : a));
      demand[hottest.index]![19] = PEAK[m]!;
    }
  }
}

/* ── Synthetic monthly totals for the 12-month range (Oct 2025 – Jun 2026) ─────────────── */
const SEASON: Record<ZoneSpec['type'], number[]> = {
  // Oct … Jun, relative to September
  climate: [0.62, 0.78, 1.05, 1.18, 1.08, 0.86, 0.58, 0.66, 0.95],
  pool: [0.7, 0.1, 0.08, 0.08, 0.08, 0.12, 0.55, 0.82, 0.9],
  rooms: [0.86, 0.72, 0.9, 0.78, 0.74, 0.9, 0.96, 0.98, 1.06],
  kitchen: [0.9, 0.74, 0.92, 0.78, 0.76, 0.92, 0.98, 1, 1.05],
  common: [1.12, 1.3, 1.42, 1.38, 1.22, 1.06, 0.92, 0.86, 0.84],
};
export const monthlyBefore: { month: string; zone: Record<string, number> }[] = [
  '2025-10',
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
].map((month, i) => ({
  month,
  zone: Object.fromEntries(ZONES.map((z) => [z.id, +(z.sep * SEASON[z.type][i]! * jitter(0.04)).toFixed(1)])),
}));
