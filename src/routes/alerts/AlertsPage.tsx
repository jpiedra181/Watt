import { Fragment, useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getRouteApi, Link } from '@tanstack/react-router';
import { Check, ChevronDown, CircleCheck, Layers, RefreshCw, Settings } from 'lucide-react';
import { queries, useAlertStatusMutation, useResolveAlertsMutation } from '@/api/queries';
import { ZoneType, type Alert, type AlertSeverity, type AlertStatus } from '@/api/schemas';
import { useDocumentTitle, usePeriod } from '@/app/usePeriod';
import { AlertItem } from '@/components/data/AlertItem/AlertItem';
import { Page, PageHeader } from '@/components/layout/Page/Page';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { DropdownMenuItem } from '@/components/ui/Menu/DropdownMenu';
import { Select } from '@/components/ui/Select/Select';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/Tabs';
import { useToast } from '@/components/ui/Toast/Toast';
import { alertGroup, alertTime } from '@/lib/dates';
import { zoneTypeName } from '@/lib/zones';
import { ResolveAlertsModal } from './ResolveAlertsModal';

const route = getRouteApi('/alerts');

const nextStatus: Record<Alert['status'], Alert['status']> = {
  new: 'reviewed',
  reviewed: 'resolved',
  resolved: 'new',
};
const zoneOptions = [
  { value: 'all', label: 'All zones', icon: Layers },
  ...ZoneType.options.map((t) => ({ value: t, label: zoneTypeName[t] })),
];
const severityOptions = [
  { value: 'all', label: 'All severities' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
];

/** Figma 04 · Alerts — Desktop 1440 (27:3596), Tablet 1024 (27:4088), Resolve modal (27:4467). */
export function AlertsPage() {
  useDocumentTitle('Alerts');
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const { id: periodId, period } = usePeriod();
  const property = useQuery(queries.property());
  const now = property.data?.now;
  const status = search.status ?? 'all';
  const query = useInfiniteQuery(
    queries.alerts({ period: periodId, status: search.status, zone: search.zone, severity: search.severity }),
  );
  const newAlerts = useInfiniteQuery(queries.alerts({ period: periodId, status: 'new' }));
  const mutation = useAlertStatusMutation();
  const resolveAll = useResolveAlertsMutation();
  const toast = useToast();
  const [resolveOpen, setResolveOpen] = useState(false);

  const counts = query.data?.pages[0]?.counts;
  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const newList = newAlerts.data?.pages[0]?.items ?? [];
  const groups = useMemo(() => {
    if (!now) return [];
    const out: { key: string; label: string; items: Alert[] }[] = [];
    for (const a of items) {
      const g = alertGroup(a.at, now);
      const last = out.at(-1);
      if (last?.key === g.key) last.items.push(a);
      else out.push({ ...g, items: [a] });
    }
    return out;
  }, [items, now]);

  const setSearch = (patch: Partial<typeof search>) =>
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, resetScroll: false });

  const act = (a: Alert) => {
    const to = nextStatus[a.status];
    mutation.mutate(
      { id: a.id, status: to },
      {
        onSuccess: () =>
          toast({
            tone: 'success',
            title: { reviewed: 'Marked as reviewed', resolved: 'Alert resolved', new: 'Alert reopened' }[to],
            description: a.title,
            action: { label: 'Undo', onClick: () => mutation.mutate({ id: a.id, status: a.status }) },
          }),
        onError: () =>
          toast({
            tone: 'error',
            title: 'Couldn’t update the alert',
            description: 'Nothing changed. Try again in a moment.',
          }),
      },
    );
  };

  const subtitle = counts
    ? `${counts.new} new · ${counts.reviewed} reviewed · ${counts.resolved} resolved in ${period?.monthName ?? ''}`
    : ' ';
  const newCount = counts?.new ?? 0;

  return (
    <Page>
      <PageHeader
        title="Alerts"
        subtitle={subtitle}
        actions={
          <>
            <Button variant="secondary" leadingIcon={Settings} asChild>
              <Link to="/settings" hash="alerts">
                Alert settings
              </Link>
            </Button>
            <Button leadingIcon={Check} onClick={() => setResolveOpen(true)} disabled={!newCount}>
              Resolve new ({newCount})
            </Button>
          </>
        }
      />

      <Tabs
        value={status}
        onValueChange={(v) => setSearch({ status: v === 'all' ? undefined : (v as AlertStatus) })}
        asChild
      >
        <section
          aria-label="Alerts list"
          className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-default bg-surface"
        >
          <div className="flex flex-wrap items-center gap-x-12 gap-y-8 border-b border-default px-16 max-lg:pt-12">
            <div className="-mx-16 min-w-0 max-w-[calc(100%+32px)] overflow-x-auto px-16 lg:mx-0 lg:max-w-none lg:px-0">
              <TabsList aria-label="Filter by status" className="gap-4">
                {(['all', 'new', 'reviewed', 'resolved'] as const).map((s) => (
                  <TabsTrigger key={s} value={s} count={counts ? counts[s] : undefined}>
                    {s === 'all' ? 'All' : s[0]!.toUpperCase() + s.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="flex-1" />
            <div className="flex w-full gap-12 pb-12 lg:w-auto lg:py-2">
              <Select
                label="Zone"
                hideLabel
                className="min-w-0 flex-1 lg:w-[160px] lg:flex-none"
                options={zoneOptions}
                value={search.zone ?? 'all'}
                onValueChange={(v) => setSearch({ zone: v === 'all' ? undefined : (v as ZoneType) })}
              />
              <Select
                label="Severity"
                hideLabel
                className="min-w-0 flex-1 lg:w-[160px] lg:flex-none"
                options={severityOptions}
                value={search.severity ?? 'all'}
                onValueChange={(v) => setSearch({ severity: v === 'all' ? undefined : (v as AlertSeverity) })}
              />
            </div>
          </div>

          <TabsContent value={status} className="flex flex-col">
            {query.isPending ? (
              <div aria-busy="true" aria-label="Loading alerts">
                <div className="h-33 border-b border-subtle bg-subtle px-16 py-8">
                  <Skeleton width={96} height={10} className="my-3" />
                </div>
                {Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-12 border-b border-subtle px-16 py-12"
                    aria-hidden="true"
                  >
                    <Skeleton shape="circle" width={8} height={8} />
                    <Skeleton shape="block" width={36} height={36} />
                    <span className="flex flex-1 flex-col gap-6">
                      <Skeleton width="40%" height={10} />
                      <Skeleton width="60%" height={8} />
                    </span>
                    <Skeleton width={40} height={10} />
                    <Skeleton width={64} height={20} />
                    <Skeleton shape="block" width={120} height={36} className="max-sm:hidden" />
                  </div>
                ))}
              </div>
            ) : query.isError ? (
              <EmptyState
                variant="error"
                title="Couldn’t load alerts"
                description="The meter gateway didn’t respond. Your data is safe — try again in a moment."
                action={
                  <Button variant="secondary" leadingIcon={RefreshCw} onClick={() => void query.refetch()}>
                    Retry
                  </Button>
                }
              />
            ) : items.length === 0 ? (
              <EmptyState
                icon={CircleCheck}
                title={
                  status === 'new'
                    ? 'No new alerts'
                    : search.zone || search.severity
                      ? 'No alerts match these filters'
                      : 'No alerts this month'
                }
                description={
                  status === 'new'
                    ? 'You’re up to date. Watt will flag peaks, night use and offline meters here.'
                    : 'Try another zone or severity.'
                }
                action={
                  search.zone || search.severity ? (
                    <Button
                      variant="secondary"
                      onClick={() => setSearch({ zone: undefined, severity: undefined })}
                    >
                      Clear filters
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                {groups.map((g) => (
                  <Fragment key={g.key + g.label}>
                    <h2 className="flex items-center gap-8 border-b border-subtle bg-subtle px-16 py-8">
                      <span className="type-label-overline text-tertiary">{g.label}</span>
                      <span className="type-caption tabular text-tertiary">
                        {g.items.length}
                        <span className="sr-only"> alerts</span>
                      </span>
                    </h2>
                    <ul>
                      {g.items.map((a) => (
                        <li key={a.id}>
                          <AlertItem
                            severity={a.severity}
                            status={a.status}
                            title={a.title}
                            meta={a.meta}
                            time={now ? alertTime(a.at, now) : ''}
                            dateTime={a.at}
                            onAction={() => act(a)}
                            actionPending={mutation.isPending && mutation.variables?.id === a.id}
                            menu={
                              <>
                                <DropdownMenuItem icon={Layers} asChild>
                                  <Link to="/zones/$type" params={{ type: a.zoneType }}>
                                    Open {zoneTypeName[a.zoneType]}
                                  </Link>
                                </DropdownMenuItem>
                                {a.status !== 'resolved' && a.status !== 'reviewed' && (
                                  <DropdownMenuItem
                                    icon={Check}
                                    onSelect={() => mutation.mutate({ id: a.id, status: 'resolved' })}
                                  >
                                    Resolve now
                                  </DropdownMenuItem>
                                )}
                              </>
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  </Fragment>
                ))}
                <div className="flex px-16 py-12">
                  {query.hasNextPage ? (
                    <Button
                      variant="ghost"
                      trailingIcon={ChevronDown}
                      loading={query.isFetchingNextPage}
                      onClick={() => void query.fetchNextPage()}
                    >
                      Load older alerts
                    </Button>
                  ) : (
                    <p className="py-8 type-caption text-tertiary">That’s everything since July.</p>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </section>
      </Tabs>

      <ResolveAlertsModal
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        alerts={newList}
        now={now}
        pending={resolveAll.isPending}
        onConfirm={(notify) =>
          resolveAll.mutate(
            newList.map((a) => a.id),
            {
              onSuccess: () => {
                setResolveOpen(false);
                toast({
                  tone: 'success',
                  title: `${newList.length} alerts resolved`,
                  description: notify
                    ? 'The maintenance team has been notified.'
                    : 'They stay in Resolved if you need them.',
                });
              },
              onError: () =>
                toast({
                  tone: 'error',
                  title: 'Couldn’t resolve the alerts',
                  description: 'Nothing changed. Try again in a moment.',
                }),
            },
          )
        }
      />
    </Page>
  );
}
