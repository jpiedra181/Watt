import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import { queries } from '@/api/queries';
import type { Overview, Period } from '@/api/schemas';
import { useDocumentTitle, usePeriod } from '@/app/usePeriod';
import { Page, PageHeader } from '@/components/layout/Page/Page';
import { Button } from '@/components/ui/Button/Button';
import { useToast } from '@/components/ui/Toast/Toast';
import { minutesAgo } from '@/lib/dates';
import { formatDayLong, formatDayShort, formatKwh, formatShare, parseLocal } from '@/lib/format';
import { ByZoneCard } from './ByZoneCard';
import { HourlyCard } from './HourlyCard';
import { KpiRow } from './KpiRow';
import { RecentAlertsCard } from './RecentAlertsCard';
import { TopSavingCard } from './TopSavingCard';

/** Figma 01 · Overview — Desktop 1440 (22:3), Tablet 1024, Mobile 390 (24:1277), Dark (24:1718). */
export function OverviewPage() {
  useDocumentTitle('Overview');
  const { id: periodId, period } = usePeriod();
  const property = useQuery(queries.property());
  const overview = useQuery(queries.overview(periodId));
  const hourly = useQuery(queries.hourly(periodId));
  const toast = useToast();

  const p = property.data;
  const day = hourly.data ? parseLocal(hourly.data.date) : p ? parseLocal(p.now) : undefined;
  const updated = p && overview.data ? `updated ${minutesAgo(overview.data.updatedAt, p.now)}` : 'updating…';

  return (
    <Page className="@container">
      <PageHeader
        title="Overview"
        subtitle={day && p ? `${formatDayLong(day)} · ${p.name} · ${updated}` : ' '}
        shortSubtitle={day ? `${formatDayShort(day)} · ${updated}` : ' '}
        actions={
          <Button
            variant="secondary"
            leadingIcon={Download}
            disabled={!overview.data}
            onClick={() => {
              if (!overview.data || !period) return;
              downloadReport(overview.data, period);
              toast({
                tone: 'info',
                title: 'Report downloaded',
                description: `${period.label} · ${formatKwh(overview.data.kpis.consumption.value)} kWh`,
              });
            }}
            className="max-sm:hidden"
          >
            <span className="max-xl:hidden">Export report</span>
            <span className="xl:hidden">Export</span>
          </Button>
        }
      />
      <KpiRow query={overview} />
      {/* Desktop: [hourly | by zone] [alerts | saving] · Tablet: hourly, [by zone | saving], alerts · Phone: one column */}
      <div className="grid gap-16 @3xl:grid-cols-2 @5xl:grid-cols-[minmax(0,1fr)_392px]">
        <HourlyCard query={hourly} className="@3xl:col-span-2 @5xl:col-span-1" />
        <ByZoneCard query={overview} />
        <RecentAlertsCard
          periodId={periodId}
          now={p?.now}
          className="@3xl:order-last @3xl:col-span-2 @5xl:order-none @5xl:col-span-1 @5xl:self-start"
        />
        <TopSavingCard className="@5xl:self-start" />
      </div>
    </Page>
  );
}

function downloadReport(o: Overview, period: Period) {
  const rows = [
    ['Watt report', period.label],
    [],
    ['Metric', 'Value', `${period.previousMonthName}`],
    ['Total consumption (kWh)', o.kpis.consumption.value, o.kpis.consumption.previous],
    ['Energy cost (€)', o.kpis.cost.value, o.kpis.cost.previous],
    ['Peak demand (kW)', o.kpis.peakDemand.value, o.kpis.peakDemand.previous],
    [
      'Per guest night (kWh)',
      o.kpis.perGuestNight.value.toFixed(1),
      o.kpis.perGuestNight.previous.toFixed(1),
    ],
    [],
    ['Zone type', 'kWh', 'Share'],
    ...o.byType.map((t) => [t.name, t.kwh, formatShare(t.share)]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `watt-report-${period.id}.csv`,
  });
  a.click();
  URL.revokeObjectURL(url);
}
