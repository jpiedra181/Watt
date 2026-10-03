import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Bell, ChevronRight, Download, Ellipsis, RefreshCw, Settings } from 'lucide-react';
import { queries } from '@/api/queries';
import type { HistoryRange, ZoneTypeDetail } from '@/api/schemas';
import { useDocumentTitle, usePeriod } from '@/app/usePeriod';
import { HistoryChart } from '@/components/charts/HistoryChart/HistoryChart';
import { Card, Page, PageHeader } from '@/components/layout/Page/Page';
import { Button } from '@/components/ui/Button/Button';
import { Delta } from '@/components/ui/Delta/Delta';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/Menu/DropdownMenu';
import { RangeSelector } from '@/components/ui/RangeSelector/RangeSelector';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { useToast } from '@/components/ui/Toast/Toast';
import { minutesAgo } from '@/lib/dates';
import { formatDayMonth, formatEuro, formatKwh, formatPercent, formatShare, parseLocal } from '@/lib/format';
import { consumptionDelta, zoneStatus, zoneTypeColor, zoneTypeIcon, zoneTypeName } from '@/lib/zones';
import { EditZoneModal } from './EditZoneModal';
import { ZoneRecommendations } from './ZoneRecommendations';

const route = getRouteApi('/zones/$type');

const ranges = [
  { value: '24h', label: '24h', description: 'Last 24 hours' },
  { value: '7d', label: '7d', description: 'Last 7 days' },
  { value: '30d', label: '30d', description: 'This month, by day' },
  { value: '12m', label: '12m', description: 'Last 12 months' },
] as const;

const rangeSubtitle: Record<HistoryRange, (month: string, prev: string) => string> = {
  '24h': () => 'Hourly kWh · today vs the same day last week',
  '7d': () => 'Daily kWh · last 7 days vs the 7 before',
  '30d': (m, p) => `Daily kWh · ${m} vs ${p}`,
  '12m': () => 'Monthly kWh · last 12 months vs the year before',
};

/** Figma 03 · Zone detail — Desktop 1440 (26:3098), Tablet 1024 (26:3535). */
export function ZoneDetailPage() {
  const { type } = route.useParams();
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const { id: periodId, period } = usePeriod();
  const range = search.range ?? '30d';
  const detail = useQuery(queries.zoneType(type, periodId));
  const history = useQuery(queries.history(type, range, periodId));
  const property = useQuery(queries.property());
  const [editOpen, setEditOpen] = useState(false);
  const toast = useToast();
  const name = zoneTypeName[type];
  const Icon = zoneTypeIcon[type];
  const d = detail.data;
  useDocumentTitle(name);

  return (
    <Page>
      <PageHeader
        breadcrumb={
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-6">
              <li>
                <Link
                  to="/zones"
                  className="rounded-xs type-body-small-strong text-brand outline-none hover:underline focus-visible:shadow-focus-ring"
                >
                  Zones
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} className="text-icon-secondary" />
              </li>
              <li aria-current="page" className="type-body-small text-secondary">
                {name}
              </li>
            </ol>
          </nav>
        }
        leading={
          <span
            aria-hidden="true"
            className="flex size-48 shrink-0 items-center justify-center rounded-md border border-default bg-subtle text-icon-primary"
          >
            <Icon size={24} />
          </span>
        }
        title={name}
        badge={
          d ? <StatusBadge tone={zoneStatus[d.status].tone}>{zoneStatus[d.status].label}</StatusBadge> : null
        }
        subtitle={d ? d.description : <Skeleton width={260} height={10} className="my-4" />}
        actions={
          <>
            <Button
              variant="secondary"
              leadingIcon={Settings}
              onClick={() => setEditOpen(true)}
              disabled={!d}
            >
              Edit zone
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton icon={Ellipsis} label={`More actions for ${name}`} tooltip={false} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem icon={Bell} asChild>
                  <Link to="/alerts" search={{ zone: type }}>
                    View alerts for {name}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  icon={Download}
                  disabled={!history.data}
                  onSelect={() => {
                    if (!history.data) return;
                    const csv = [
                      'date,kwh,previous',
                      ...history.data.points.map((p) => `${p.key},${p.value ?? ''},${p.previous ?? ''}`),
                    ].join('\n');
                    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
                    Object.assign(document.createElement('a'), {
                      href: url,
                      download: `watt-${type}-${range}-${periodId}.csv`,
                    }).click();
                    URL.revokeObjectURL(url);
                    toast({ tone: 'success', title: 'CSV exported', description: `${name} · ${range}` });
                  }}
                >
                  Export history (CSV)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {detail.isError ? (
        <div className="rounded-lg border border-default bg-surface">
          <EmptyState
            variant="error"
            title={`Couldn’t load ${name}`}
            description="The meter gateway didn’t respond. Your data is safe — try again in a moment."
            action={
              <Button variant="secondary" leadingIcon={RefreshCw} onClick={() => void detail.refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <StatsStrip
            detail={d}
            month={period?.monthName ?? 'September'}
            previousMonth={period?.previousMonthName ?? 'August'}
          />

          <div className="grid gap-16 xl:grid-cols-[minmax(0,1fr)_360px]">
            <Card
              title="Consumption history"
              subtitle={rangeSubtitle[range](period?.monthName ?? '', period?.previousMonthName ?? '')}
              actions={
                <RangeSelector
                  label="History range"
                  options={ranges}
                  value={range}
                  onValueChange={(r) =>
                    void navigate({
                      search: (prev) => ({ ...prev, range: r === '30d' ? undefined : r }),
                      replace: true,
                      resetScroll: false,
                    })
                  }
                  className="max-sm:hidden"
                />
              }
            >
              <RangeSelector
                label="History range"
                options={ranges}
                value={range}
                onValueChange={(r) =>
                  void navigate({
                    search: (prev) => ({ ...prev, range: r === '30d' ? undefined : r }),
                    replace: true,
                    resetScroll: false,
                  })
                }
                className="self-start sm:hidden"
              />
              <HistoryChart
                status={history.isPending ? 'loading' : history.isError ? 'error' : 'ready'}
                data={history.data?.points ?? []}
                ticks={history.data?.ticks}
                seriesLabel={history.data?.seriesLabel ?? name}
                previousLabel={history.data?.previousLabel ?? ''}
                color={zoneTypeColor[type]}
                emptyDescription="Readings appear within 15 minutes of connecting a meter."
                onRetry={() => void history.refetch()}
              />
            </Card>
            <SubZonesCard detail={d} name={name} type={type} now={property.data?.now} />
          </div>

          <ZoneRecommendations type={type} />
        </>
      )}

      {d && <EditZoneModal open={editOpen} onOpenChange={setEditOpen} detail={d} />}
    </Page>
  );
}

function StatsStrip({
  detail: d,
  month,
  previousMonth,
}: {
  detail?: ZoneTypeDetail;
  month: string;
  previousMonth: string;
}) {
  const kwhDelta = d && consumptionDelta(d.kwh, d.previousKwh);
  const costDelta = d && consumptionDelta(d.cost, d.previousCost);
  const stats = [
    {
      label: month,
      value: d && formatKwh(d.kwh),
      unit: 'kWh',
      meta: kwhDelta && (
        <>
          <Delta
            value={formatPercent(kwhDelta.change)}
            direction={kwhDelta.direction}
            sentiment={kwhDelta.sentiment}
          />
          <span>vs {previousMonth}</span>
        </>
      ),
    },
    {
      label: 'Cost',
      value: d && formatEuro(d.cost),
      unit: '€',
      meta: costDelta && (
        <>
          <Delta
            value={formatPercent(costDelta.change)}
            direction={costDelta.direction}
            sentiment={costDelta.sentiment}
          />
          <span>vs {previousMonth}</span>
        </>
      ),
    },
    {
      label: 'Peak day',
      value: d && formatKwh(d.peakDay.kwh),
      unit: 'kWh',
      meta: d && <span>{`${formatDayMonth(parseLocal(d.peakDay.date))} · ${d.peakDay.note}`}</span>,
    },
    {
      label: 'Share of property',
      value: d && String(Math.round(d.share * 100)),
      unit: '%',
      meta: d && <span>{d.shareNote}</span>,
    },
  ];
  return (
    <section
      aria-label="Key figures"
      aria-busy={!d || undefined}
      className="grid grid-cols-2 overflow-hidden rounded-lg border border-default bg-surface lg:grid-cols-4"
    >
      {stats.map((s, i) => (
        <div
          key={s.label}
          className={[
            'flex min-w-0 flex-col gap-6 px-16 py-16 sm:px-20',
            i % 2 === 1 ? 'border-l border-subtle' : '',
            i >= 2 ? 'max-lg:border-t border-subtle' : '',
            i === 2 ? 'lg:border-l' : '',
          ].join(' ')}
        >
          <p className="type-label-overline text-tertiary">{s.label}</p>
          {s.value ? (
            <p className="flex items-baseline gap-4">
              <span className="type-data-large tabular text-primary">{s.value}</span>
              <span className="type-body-small text-tertiary">{s.unit}</span>
            </p>
          ) : (
            <Skeleton shape="block" width={96} height={28} />
          )}
          <div className="flex min-h-20 flex-wrap items-center gap-6 type-caption text-tertiary">
            {s.meta ?? <Skeleton width={120} height={10} />}
          </div>
        </div>
      ))}
    </section>
  );
}

function SubZonesCard({
  detail: d,
  name,
  type,
  now,
}: {
  detail?: ZoneTypeDetail;
  name: string;
  type: ZoneTypeDetail['type'];
  now?: string;
}) {
  return (
    <Card title="Sub-zones" subtitle={`Share of ${name.split(' (')[0]} this month`} className="gap-12">
      {!d ? (
        <div className="flex flex-col gap-12" aria-busy="true" aria-label="Loading sub-zones">
          {[0, 1].map((i) => (
            <Skeleton key={i} shape="block" width="100%" height={72} />
          ))}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-12">
            {d.subZones.map((s) => (
              <li key={s.id} className="flex flex-col gap-8 rounded-md bg-subtle p-12">
                <div className="flex items-center gap-8">
                  <p className="min-w-0 flex-1 truncate type-body-small-strong text-primary">{s.name}</p>
                  <StatusBadge tone={zoneStatus[s.status].tone}>{zoneStatus[s.status].label}</StatusBadge>
                </div>
                <div className="flex items-center gap-10">
                  <span
                    aria-hidden="true"
                    className="h-6 min-w-0 flex-1 overflow-hidden rounded-full bg-hover"
                  >
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${s.share * 100}%`, background: zoneTypeColor[type] }}
                    />
                  </span>
                  <span className="type-data-mono tabular whitespace-nowrap text-primary">
                    {formatKwh(s.kwh)} kWh
                  </span>
                  <span className="w-32 text-right type-data-mono tabular text-tertiary">
                    <span className="sr-only">, </span>
                    {formatShare(s.share)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <h3 className="pt-8 type-label-overline text-tertiary">Meters</h3>
          <ul className="flex flex-col gap-12">
            {d.meters.map((m) => (
              <li key={m.id} className="flex items-center gap-10">
                <span
                  aria-hidden="true"
                  className={`size-8 shrink-0 rounded-full ${m.online ? 'bg-good-solid' : 'bg-critical-solid'}`}
                />
                <div className="flex min-w-0 flex-col">
                  <p className="truncate type-body-small text-primary">
                    {m.code} · {m.name}
                  </p>
                  <p className="type-caption text-tertiary">
                    {m.online ? 'Online' : 'Offline'} · {now ? minutesAgo(m.lastSeen, now) : '—'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
