import { Bed, Lightbulb, Sofa, Thermometer, Utensils, Waves, Zap, type LucideIcon } from 'lucide-react';
import type { ZoneIcon, ZoneStatus, ZoneType } from '@/api/schemas';

/** Series colours are fixed per zone type (Figma: Climate = blue, Pool = cyan, Rooms = violet, Kitchen = plum). */
export const zoneTypeColor: Record<ZoneType, string> = {
  climate: 'var(--color-chart-series-1)',
  pool: 'var(--color-chart-series-2)',
  rooms: 'var(--color-chart-series-3)',
  kitchen: 'var(--color-chart-series-4)',
  common: 'var(--color-chart-series-other)',
};

export const zoneTypeName: Record<ZoneType, string> = {
  climate: 'Climate (HVAC)',
  pool: 'Pool',
  rooms: 'Rooms',
  kitchen: 'Kitchen',
  common: 'Common areas',
};

export const zoneTypeIcon: Record<ZoneType, LucideIcon> = {
  climate: Thermometer,
  pool: Waves,
  rooms: Bed,
  kitchen: Utensils,
  common: Sofa,
};

export const zoneIcon: Record<ZoneIcon, LucideIcon> = {
  thermometer: Thermometer,
  waves: Waves,
  bed: Bed,
  utensils: Utensils,
  zap: Zap,
  sofa: Sofa,
  lightbulb: Lightbulb,
};

/** Consumption state → Status Badge tone and wording (Figma: Good = Normal, Warning = Attention, Critical = Alert). */
export const zoneStatus: Record<ZoneStatus, { tone: 'good' | 'warning' | 'critical'; label: string }> = {
  normal: { tone: 'good', label: 'Normal' },
  attention: { tone: 'warning', label: 'Attention' },
  alert: { tone: 'critical', label: 'Alert' },
};

/** Changes under 2% are shown as neutral (grey) — Figma Zones table. */
export function consumptionDelta(current: number, previous: number) {
  const change = previous ? (current - previous) / previous : 0;
  return {
    change,
    direction: (change >= 0 ? 'up' : 'down') as 'up' | 'down',
    sentiment: (Math.abs(change) < 0.02 ? 'neutral' : change > 0 ? 'negative' : 'positive') as
      'positive' | 'negative' | 'neutral',
  };
}
