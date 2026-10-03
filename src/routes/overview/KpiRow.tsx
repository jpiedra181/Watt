import type { UseQueryResult } from '@tanstack/react-query';
import { Bed, Euro, Gauge, Zap } from 'lucide-react';
import type { Overview } from '@/api/schemas';
import { KpiCard, type KpiCardProps } from '@/components/data/KpiCard/KpiCard';
import { formatEuro, formatKwh, formatPercent } from '@/lib/format';
import { consumptionDelta } from '@/lib/zones';

type Metric = Overview['kpis']['consumption'];

/** Four KPI cards: 4 columns from ~1024px of content width, 2 below (Figma tablet/mobile). */
export function KpiRow({ query }: { query: UseQueryResult<Overview> }) {
  const o = query.data;
  const prev = o?.period.previousMonthName ?? '';
  const status: KpiCardProps['status'] = query.isPending
    ? 'loading'
    : query.isError
      ? 'error'
      : o && o.kpis.consumption.trend.length === 0
        ? 'empty'
        : 'ready';

  const common = (m: Metric | undefined): Partial<KpiCardProps> => {
    if (!m) return {};
    const d = consumptionDelta(m.value, m.previous);
    return {
      delta: { value: formatPercent(d.change), direction: d.direction, sentiment: d.sentiment },
      comparison: `vs ${prev}`,
      shortComparison: `vs ${prev.slice(0, 3)}`,
      trend: m.trend,
    };
  };
  const shared = {
    status,
    onRetry: () => void query.refetch(),
    errorDetail: 'Gateway timeout',
  };

  return (
    <section aria-labelledby="kpi-title" className="grid grid-cols-2 gap-12 md:gap-16 @5xl:grid-cols-4">
      <h2 id="kpi-title" className="sr-only">
        Key figures{o ? ` for ${o.period.label}` : ''}
      </h2>
      <KpiCard
        {...shared}
        {...common(o?.kpis.consumption)}
        label="Total consumption"
        shortLabel="Consumption"
        icon={Zap}
        info="Energy measured by all 24 meters, including common areas, in the selected month."
        value={o && formatKwh(o.kpis.consumption.value)}
        unit="kWh"
        to="/zones"
      />
      <KpiCard
        {...shared}
        {...common(o?.kpis.cost)}
        label="Energy cost"
        shortLabel="Cost"
        icon={Euro}
        info="Energy term at your average price per kWh, VAT included. Power and fixed charges are billed separately."
        value={o && formatEuro(o.kpis.cost.value)}
        unit="€"
        to="/zones"
        search={(prev) => ({ ...prev, sort: 'cost.desc' })}
      />
      <KpiCard
        {...shared}
        {...common(o?.kpis.peakDemand)}
        label="Peak demand"
        icon={Gauge}
        info="Highest hourly average demand this month. Above the contracted power the supplier charges an excess."
        value={o && formatKwh(o.kpis.peakDemand.value, 1)}
        unit="kW"
        to="/alerts"
      />
      <KpiCard
        {...shared}
        {...common(o?.kpis.perGuestNight)}
        label="Per guest night"
        icon={Bed}
        info="Total consumption divided by the guest nights recorded in your booking system."
        value={o && formatKwh(o.kpis.perGuestNight.value, 1)}
        unit="kWh"
      />
    </section>
  );
}
