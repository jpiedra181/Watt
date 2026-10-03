import type { UseQueryResult } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronRight, Lightbulb, RefreshCw } from 'lucide-react';
import type { Overview } from '@/api/schemas';
import { ZoneBreakdown } from '@/components/charts/ZoneBreakdown/ZoneBreakdown';
import { Card } from '@/components/layout/Page/Page';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { formatKwh } from '@/lib/format';
import { zoneTypeColor } from '@/lib/zones';

export function ByZoneCard({ query }: { query: UseQueryResult<Overview> }) {
  const o = query.data;
  const empty = o && o.byType.length === 0;
  return (
    <Card
      title="By zone"
      subtitle={o ? `${o.period.monthName} · ${formatKwh(o.kpis.consumption.value)} kWh` : ' '}
      actions={
        <Button variant="ghost" trailingIcon={ChevronRight} asChild className="@max-5xl:hidden">
          <Link to="/zones">Zones</Link>
        </Button>
      }
      className="h-full"
    >
      {query.isError ? (
        <EmptyState
          compact
          variant="error"
          title="Couldn’t load zones"
          description="The meter gateway didn’t respond."
          action={
            <Button variant="secondary" leadingIcon={RefreshCw} onClick={() => void query.refetch()}>
              Retry
            </Button>
          }
          className="flex-1 justify-center"
        />
      ) : empty ? (
        <EmptyState
          compact
          title="No readings yet"
          description="Connect a meter to see how each zone contributes."
          className="flex-1 justify-center"
        />
      ) : (
        <>
          <ZoneBreakdown
            loading={query.isPending}
            items={(o?.byType ?? []).map((t) => ({
              id: t.type,
              name: t.name,
              kwh: t.kwh,
              share: t.share,
              color: zoneTypeColor[t.type],
              to: `/zones/${t.type}`,
            }))}
          />
          {o?.insight && (
            <p className="mt-auto flex gap-10 rounded-md bg-subtle p-12 type-caption text-secondary @max-5xl:hidden">
              <Lightbulb size={16} aria-hidden="true" className="shrink-0 text-icon-brand" />
              {o.insight}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
