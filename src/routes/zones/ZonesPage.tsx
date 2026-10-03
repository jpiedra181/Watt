import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Funnel, Plus, RefreshCw, Search, X } from 'lucide-react';
import { queries } from '@/api/queries';
import { ZoneStatus, ZoneType, type ZoneRow } from '@/api/schemas';
import { PAGE_SIZES } from '@/app/search';
import { useDocumentTitle, usePeriod } from '@/app/usePeriod';
import { Page, PageHeader } from '@/components/layout/Page/Page';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { Button } from '@/components/ui/Button/Button';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { Input } from '@/components/ui/Input/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/Menu/DropdownMenu';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { Select } from '@/components/ui/Select/Select';
import { useToast } from '@/components/ui/Toast/Toast';
import { formatShare } from '@/lib/format';
import { zoneStatus, zoneTypeName } from '@/lib/zones';
import { CompareModal, ThresholdModal, ZoneFormModal } from './ZoneModals';
import { ZonesTable } from './ZonesTable';
import { useZonesSearch } from './useZonesSearch';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  ...ZoneStatus.options.map((s) => ({ value: s, label: zoneStatus[s].label })),
];
const typeOptions = [
  { value: 'all', label: 'All zone types' },
  ...ZoneType.options.map((t) => ({ value: t, label: zoneTypeName[t] })),
];

/** Figma 02 · Zones — Desktop 1440 (25:1941), Tablet 1024 (25:2761). */
export function ZonesPage() {
  useDocumentTitle('Zones');
  const { period } = usePeriod();
  const { search, params, selected, setSelected, update, hasFilters } = useZonesSearch();
  const query = useQuery(queries.zones(params));
  const qc = useQueryClient();
  const toast = useToast();
  // While typing, the field shows a local draft; the URL is updated after a 300ms pause.
  const [draft, setDraft] = useState<string | null>(null);
  const q = draft ?? search.q ?? '';
  const wide = useMediaQuery('(min-width: 1280px)');
  const [modal, setModal] = useState<
    null | { kind: 'add' } | { kind: 'compare' } | { kind: 'threshold'; rows: ZoneRow[] }
  >(null);

  // Debounced search → URL (replace, so typing doesn't flood the history).
  useEffect(() => {
    if (draft === null) return;
    const t = setTimeout(() => {
      void update({ q: draft.trim() || undefined }, { replace: true });
      setDraft(null);
    }, 300);
    return () => clearTimeout(t);
  }, [draft, update]);

  const data = query.data;
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / params.size));
  useEffect(() => {
    if (data && params.page > pageCount) void update({ page: pageCount }, { replace: true });
  }, [data, params.page, pageCount, update]);

  /** Every row matching the filters (all pages), for exports and bulk actions. */
  const fetchAll = useCallback(
    () => qc.fetchQuery(queries.zones({ ...params, page: 1, size: 100 })).then((r) => r.items),
    [qc, params],
  );

  const exportRows = useCallback(
    (rows: ZoneRow[], name: string) => {
      const header = [
        'Zone',
        'Type',
        'Status',
        'kWh',
        `${period?.previousMonthName ?? 'Previous'} kWh`,
        'Cost (€)',
        'Share',
      ];
      const lines = rows.map((r) =>
        [
          r.name,
          zoneTypeName[r.type],
          zoneStatus[r.status].label,
          r.kwh,
          r.previousKwh,
          r.cost.toFixed(2),
          formatShare(r.share),
        ]
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(','),
      );
      const url = URL.createObjectURL(
        new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' }),
      );
      Object.assign(document.createElement('a'), { href: url, download: `${name}.csv` }).click();
      URL.revokeObjectURL(url);
      toast({
        tone: 'success',
        title: 'CSV exported',
        description: `${rows.length} zone${rows.length === 1 ? '' : 's'} · ${period?.label ?? ''}`,
      });
    },
    [period, toast],
  );

  const exportAll = () => void fetchAll().then((rows) => exportRows(rows, `watt-zones-${params.period}`));
  const exportSelected = () =>
    void fetchAll().then((rows) =>
      exportRows(
        rows.filter((r) => selected.has(r.id)),
        `watt-zones-selected-${params.period}`,
      ),
    );

  const subtitle = data
    ? `${data.summary.zones} zones · ${data.summary.meters} meters · ${period?.label ?? ''}`
    : ' ';

  return (
    <Page>
      <PageHeader
        title="Zones"
        subtitle={subtitle}
        actions={
          <>
            <Button variant="secondary" leadingIcon={Download} onClick={exportAll} disabled={!total}>
              <span className="lg:hidden xl:inline">Export CSV</span>
              <span className="hidden lg:inline xl:hidden">Export</span>
            </Button>
            <Button leadingIcon={Plus} onClick={() => setModal({ kind: 'add' })}>
              Add zone
            </Button>
          </>
        }
      />

      <section
        aria-label="Zones table"
        className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-default bg-surface"
      >
        <div className="flex flex-wrap items-center gap-12 p-16" role="search" aria-label="Filter zones">
          <Input
            label="Search zones"
            hideLabel
            leadingIcon={Search}
            placeholder="Search zones…"
            value={q}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setDraft('')}
            className="w-full sm:w-[240px] xl:w-[280px]"
            type="search"
          />
          <Select
            label="Status"
            hideLabel
            className="min-w-0 flex-1 sm:w-[180px] sm:flex-none"
            options={statusOptions}
            value={search.status ?? 'all'}
            onValueChange={(v) => update({ status: v === 'all' ? undefined : (v as ZoneStatus) })}
          />
          <Select
            label="Zone type"
            hideLabel
            className="min-w-0 flex-1 sm:w-[180px] sm:flex-none"
            options={typeOptions}
            value={search.type ?? 'all'}
            onValueChange={(v) => update({ type: v === 'all' ? undefined : (v as ZoneType) })}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {wide ? (
                <Button
                  variant="ghost"
                  leadingIcon={Funnel}
                  aria-label={search.trend ? 'More filters, 1 active' : 'More filters'}
                >
                  More filters
                  {search.trend && (
                    <span className="rounded-full bg-brand-subtle px-6 type-caption-strong text-brand">
                      1
                    </span>
                  )}
                </Button>
              ) : (
                <IconButton
                  icon={Funnel}
                  label={search.trend ? 'More filters, 1 active' : 'More filters'}
                  className={search.trend ? 'border-brand text-icon-brand' : undefined}
                />
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Change vs {period?.previousMonthName ?? 'last month'}</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={search.trend ?? 'any'}
                onValueChange={(v) => update({ trend: v === 'any' ? undefined : (v as 'up' | 'down') })}
              >
                <DropdownMenuRadioItem value="any">Any change</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="up">Consuming more</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="down">Consuming less</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {selected.size > 0 && (
          <div className="px-16 pb-12">
            <div
              role="toolbar"
              aria-label="Bulk actions"
              className="flex flex-wrap items-center gap-4 rounded-md bg-selected py-4 pl-12 pr-8"
            >
              <p className="type-body-small-strong text-brand" aria-live="polite">
                {selected.size} zone{selected.size === 1 ? '' : 's'} selected
              </p>
              <span
                aria-hidden="true"
                className="mx-8 h-16 w-px bg-[var(--color-border-strong)] max-sm:hidden"
              />
              <Button
                variant="ghost"
                onClick={() => setModal({ kind: 'compare' })}
                disabled={selected.size < 2}
              >
                Compare
              </Button>
              <Button
                variant="ghost"
                onClick={() =>
                  void fetchAll().then((rows) =>
                    setModal({ kind: 'threshold', rows: rows.filter((r) => selected.has(r.id)) }),
                  )
                }
              >
                Set thresholds
              </Button>
              <Button variant="ghost" onClick={exportSelected} className="max-xl:hidden">
                Export
              </Button>
              <span className="flex-1" />
              <Button variant="ghost" leadingIcon={X} onClick={() => setSelected(new Set())}>
                Clear selection
              </Button>
            </div>
          </div>
        )}

        {query.isError ? (
          <EmptyState
            variant="error"
            title="Couldn’t load zones"
            description="The meter gateway didn’t respond. Your data is safe — try again in a moment."
            action={
              <Button variant="secondary" leadingIcon={RefreshCw} onClick={() => void query.refetch()}>
                Retry
              </Button>
            }
            className="border-t border-default"
          />
        ) : data && total === 0 && !query.isPlaceholderData ? (
          hasFilters ? (
            <EmptyState
              variant="no-results"
              title={search.q ? `No zones match “${search.q}”` : 'No zones match these filters'}
              description={`Try another name or clear the filters to see all ${data.summary.zones} zones.`}
              action={
                <Button
                  variant="secondary"
                  onClick={() =>
                    update({ q: undefined, status: undefined, type: undefined, trend: undefined })
                  }
                >
                  Clear filters
                </Button>
              }
              className="border-t border-default"
            />
          ) : (
            <EmptyState
              title="No readings yet"
              description="Connect a meter to start tracking this property. Data appears within 15 minutes."
              action={
                <Button leadingIcon={Plus} onClick={() => setModal({ kind: 'add' })}>
                  Connect meter
                </Button>
              }
              className="border-t border-default"
            />
          )
        ) : (
          <>
            <ZonesTable
              rows={data?.items ?? []}
              loading={query.isPending}
              stale={query.isPlaceholderData && query.isFetching}
              sort={params.sort}
              onSortChange={(sort) => void update({ sort }, { keepPage: false })}
              selected={selected}
              onSelectedChange={setSelected}
              previousMonth={period?.previousMonthName ?? 'August'}
              onSetThreshold={(row) => setModal({ kind: 'threshold', rows: [row] })}
              onExport={(rows) => exportRows(rows, `watt-${rows[0]?.id ?? 'zone'}-${params.period}`)}
            />
            <Pagination
              page={Math.min(params.page, pageCount)}
              pageSize={params.size}
              total={total}
              itemLabel="zones"
              pageSizeOptions={[...PAGE_SIZES]}
              onPageChange={(page) => void update({ page }, { keepPage: true })}
              onPageSizeChange={(size) => void update({ size, page: undefined })}
            />
          </>
        )}
      </section>

      <ZoneFormModal open={modal?.kind === 'add'} onOpenChange={(o) => !o && setModal(null)} />
      <CompareModal
        open={modal?.kind === 'compare'}
        onOpenChange={(o) => !o && setModal(null)}
        load={() => fetchAll().then((rows) => rows.filter((r) => selected.has(r.id)))}
        previousMonth={period?.previousMonthName ?? 'August'}
      />
      <ThresholdModal
        open={modal?.kind === 'threshold'}
        onOpenChange={(o) => !o && setModal(null)}
        rows={modal?.kind === 'threshold' ? modal.rows : []}
      />
    </Page>
  );
}
