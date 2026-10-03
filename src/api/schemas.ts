/**
 * API contract. The zod schemas are the single source of truth: the client validates responses
 * in development (contract drift fails loudly) and the mock API is typed from the same schemas.
 */
import { z } from 'zod';

export const ZoneStatus = z.enum(['normal', 'attention', 'alert']);
export type ZoneStatus = z.infer<typeof ZoneStatus>;

export const ZoneType = z.enum(['climate', 'pool', 'rooms', 'kitchen', 'common']);
export type ZoneType = z.infer<typeof ZoneType>;

export const ZoneIcon = z.enum(['thermometer', 'waves', 'bed', 'utensils', 'zap', 'sofa', 'lightbulb']);
export type ZoneIcon = z.infer<typeof ZoneIcon>;

export const Period = z.object({
  id: z.string(), // "2026-09"
  label: z.string(), // "September 2026"
  shortLabel: z.string(), // "Sep 2026"
  monthName: z.string(), // "September"
  previousMonthName: z.string(), // "August"
});
export type Period = z.infer<typeof Period>;

export const Property = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  rooms: z.number(),
  contractedKw: z.number(),
  demandKw: z.number(),
  now: z.string(),
  updatedAt: z.string(),
  periods: z.array(Period),
  user: z.object({ name: z.string(), initials: z.string(), role: z.string() }),
  newAlerts: z.number(),
});
export type Property = z.infer<typeof Property>;

const Metric = z.object({ value: z.number(), previous: z.number(), trend: z.array(z.number()) });

export const Overview = z.object({
  period: Period,
  kpis: z.object({
    consumption: Metric,
    cost: Metric,
    peakDemand: Metric,
    perGuestNight: Metric,
  }),
  byType: z.array(z.object({ type: ZoneType, name: z.string(), kwh: z.number(), share: z.number() })),
  insight: z.string(),
  updatedAt: z.string(),
});
export type Overview = z.infer<typeof Overview>;

export const Hourly = z.object({
  date: z.string(),
  weekday: z.string(),
  contractedKw: z.number(),
  points: z.array(z.object({ hour: z.number(), kwh: z.number().nullable(), typical: z.number() })),
});
export type Hourly = z.infer<typeof Hourly>;

export const ZoneRow = z.object({
  id: z.string(),
  name: z.string(),
  type: ZoneType,
  detail: z.string(),
  icon: ZoneIcon,
  status: ZoneStatus,
  kwh: z.number(),
  previousKwh: z.number(),
  cost: z.number(),
  share: z.number(),
  meters: z.number(),
});
export type ZoneRow = z.infer<typeof ZoneRow>;

export const ZonesPage = z.object({
  items: z.array(ZoneRow),
  total: z.number(),
  page: z.number(),
  size: z.number(),
  summary: z.object({ zones: z.number(), meters: z.number() }),
});
export type ZonesPage = z.infer<typeof ZonesPage>;

export const Meter = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  zoneId: z.string(),
  online: z.boolean(),
  lastSeen: z.string(),
});
export type Meter = z.infer<typeof Meter>;

export const ZoneTypeDetail = z.object({
  type: ZoneType,
  name: z.string(),
  status: ZoneStatus,
  description: z.string(),
  kwh: z.number(),
  previousKwh: z.number(),
  cost: z.number(),
  previousCost: z.number(),
  peakDay: z.object({ date: z.string(), kwh: z.number(), note: z.string() }),
  share: z.number(),
  shareNote: z.string(),
  subZones: z.array(
    z.object({ id: z.string(), name: z.string(), status: ZoneStatus, kwh: z.number(), share: z.number() }),
  ),
  meters: z.array(Meter),
});
export type ZoneTypeDetail = z.infer<typeof ZoneTypeDetail>;

export const HistoryRange = z.enum(['24h', '7d', '30d', '12m']);
export type HistoryRange = z.infer<typeof HistoryRange>;

export const History = z.object({
  range: HistoryRange,
  seriesLabel: z.string(),
  previousLabel: z.string(),
  points: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      longLabel: z.string(),
      value: z.number().nullable(),
      previous: z.number().nullable(),
    }),
  ),
  ticks: z.array(z.string()),
});
export type History = z.infer<typeof History>;

export const AlertStatus = z.enum(['new', 'reviewed', 'resolved']);
export type AlertStatus = z.infer<typeof AlertStatus>;
export const AlertSeverity = z.enum(['critical', 'warning']);
export type AlertSeverity = z.infer<typeof AlertSeverity>;

export const Alert = z.object({
  id: z.string(),
  title: z.string(),
  meta: z.string(),
  zoneType: ZoneType,
  zoneName: z.string(),
  severity: AlertSeverity,
  status: AlertStatus,
  at: z.string(),
});
export type Alert = z.infer<typeof Alert>;

export const AlertCounts = z.object({
  all: z.number(),
  new: z.number(),
  reviewed: z.number(),
  resolved: z.number(),
});
export type AlertCounts = z.infer<typeof AlertCounts>;

export const AlertsPage = z.object({
  items: z.array(Alert),
  nextCursor: z.string().nullable(),
  counts: AlertCounts,
});
export type AlertsPage = z.infer<typeof AlertsPage>;

export const Recommendation = z.object({
  id: z.string(),
  zoneType: ZoneType,
  title: z.string(),
  description: z.string(),
  savings: z.string(),
  estimate: z.string(),
  monthlyKwh: z.number(),
  monthlyEuro: z.number(),
  status: z.enum(['open', 'applied', 'dismissed']),
  appliedAt: z.string().nullable(),
});
export type Recommendation = z.infer<typeof Recommendation>;

export const Settings = z.object({
  property: z.object({
    name: z.string().min(1),
    type: z.string(),
    timezone: z.string(),
    currency: z.string(),
  }),
  contract: z.object({
    supplier: z.string(),
    tariff: z.string(),
    contractedKw: z.number(),
    pricePerKwh: z.number(),
    billingDay: z.number().nullable(),
    gateway: z.string().nullable(),
  }),
  alerts: z.object({
    attentionPct: z.number(),
    alertPct: z.number(),
    dailySummary: z.boolean(),
    pushPeaks: z.boolean(),
    weeklySavings: z.boolean(),
    autoApply: z.boolean(),
    notify: z.array(z.string()),
  }),
});
export type Settings = z.infer<typeof Settings>;

export const SearchResults = z.object({
  zones: z.array(z.object({ id: z.string(), name: z.string(), type: ZoneType, detail: z.string() })),
  meters: z.array(z.object({ id: z.string(), code: z.string(), name: z.string(), type: ZoneType })),
  alerts: z.array(z.object({ id: z.string(), title: z.string(), meta: z.string(), status: AlertStatus })),
});
export type SearchResults = z.infer<typeof SearchResults>;

export const ApiError = z.object({ message: z.string(), code: z.string().optional() });
export type ApiError = z.infer<typeof ApiError>;
