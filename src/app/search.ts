/**
 * URL state. Everything a user might want to share or bookmark lives in the query string and is
 * validated here; invalid values fall back to defaults instead of breaking the page.
 */
import { z } from 'zod';
import { AlertSeverity, AlertStatus, HistoryRange, ZoneStatus, ZoneType } from '@/api/schemas';

export const DEFAULT_PERIOD = '2026-09';

export const rootSearch = z.object({
  /** Reporting month, e.g. 2026-08. Shared by every page. */
  period: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional()
    .catch(undefined),
});

export const ZONE_SORTS = ['zone', 'status', 'consumption', 'change', 'cost'] as const;
export type ZoneSortKey = (typeof ZONE_SORTS)[number];
export const PAGE_SIZES = [10, 25, 50] as const;

export const zonesSearch = z.object({
  q: z.string().max(80).optional().catch(undefined),
  status: ZoneStatus.optional().catch(undefined),
  type: ZoneType.optional().catch(undefined),
  /** "More filters": zones consuming more (up) or less (down) than last month. */
  trend: z.enum(['up', 'down']).optional().catch(undefined),
  /** "<column>.<asc|desc>", default consumption.desc */
  sort: z
    .string()
    .regex(new RegExp(`^(${ZONE_SORTS.join('|')})\\.(asc|desc)$`))
    .optional()
    .catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
  size: z.coerce
    .number()
    .refine((n) => (PAGE_SIZES as readonly number[]).includes(n))
    .optional()
    .catch(undefined),
  /** Selected zone ids, comma-separated — survives reloads and shared links. */
  selected: z.string().optional().catch(undefined),
});
export type ZonesSearch = z.infer<typeof zonesSearch>;

export const zoneDetailSearch = z.object({
  range: HistoryRange.optional().catch(undefined),
});

export const alertsSearch = z.object({
  status: AlertStatus.optional().catch(undefined),
  zone: ZoneType.optional().catch(undefined),
  severity: AlertSeverity.optional().catch(undefined),
});
export type AlertsSearch = z.infer<typeof alertsSearch>;
