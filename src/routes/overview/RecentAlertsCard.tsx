import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronRight, CircleCheck, RefreshCw } from 'lucide-react';
import { queries } from '@/api/queries';
import { AlertItem } from '@/components/data/AlertItem/AlertItem';
import { Button } from '@/components/ui/Button/Button';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { cn } from '@/lib/cn';
import { relativeDay } from '@/lib/dates';

/** Overview "Recent alerts": the 4 latest alerts, no row actions (Figma `Show actions=false`). */
export function RecentAlertsCard({
  periodId,
  now,
  className,
}: {
  periodId: string;
  now?: string;
  className?: string;
}) {
  const query = useInfiniteQuery(queries.alerts({ period: periodId }));
  const first = query.data?.pages[0];
  const items = first?.items.slice(0, 4) ?? [];
  const newCount = first?.counts.new ?? 0;

  return (
    <section
      aria-labelledby="recent-alerts-title"
      className={cn(
        'flex min-w-0 flex-col gap-4 rounded-lg border border-default bg-surface px-16 pb-4 pt-16 md:px-20 md:pb-8 md:pt-20',
        className,
      )}
    >
      <div className="flex min-h-54 items-center gap-12 pb-8">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-8">
          <h2 id="recent-alerts-title" className="type-heading-section text-primary">
            Recent alerts
          </h2>
          {newCount > 0 && <StatusBadge tone="brand">{newCount} new</StatusBadge>}
        </div>
        <Button variant="ghost" trailingIcon={ChevronRight} asChild>
          <Link to="/alerts" aria-label="View all alerts">
            <span className="max-sm:hidden">View all</span>
            <span className="sm:hidden">All</span>
          </Link>
        </Button>
      </div>

      {query.isPending ? (
        <ul aria-busy="true" aria-label="Loading alerts" className="flex flex-col">
          {[0, 1, 2, 3].map((i) => (
            <li
              key={i}
              className="flex items-center gap-12 border-b border-subtle px-16 py-12 last:border-0"
              aria-hidden="true"
            >
              <Skeleton shape="circle" width={8} height={8} />
              <Skeleton shape="block" width={36} height={36} />
              <span className="flex flex-1 flex-col gap-6">
                <Skeleton width="60%" height={10} />
                <Skeleton width="80%" height={8} />
              </span>
              <Skeleton width={56} height={16} />
            </li>
          ))}
        </ul>
      ) : query.isError ? (
        <EmptyState
          compact
          variant="error"
          title="Couldn’t load alerts"
          description="Try again in a moment."
          action={
            <Button variant="secondary" leadingIcon={RefreshCw} onClick={() => void query.refetch()}>
              Retry
            </Button>
          }
          className="py-24"
        />
      ) : items.length === 0 ? (
        <EmptyState
          compact
          icon={CircleCheck}
          title="No alerts this month"
          description="Watt will flag peaks, night use and offline meters here."
          className="py-24"
        />
      ) : (
        <ul className="flex flex-col">
          {items.map((a, i) => (
            <li
              key={a.id}
              className={cn(
                '[&:last-child>div]:border-0',
                i === 3 && 'max-sm:hidden',
                i === 2 && 'max-sm:[&>div]:border-0',
              )}
            >
              <AlertItem
                severity={a.severity}
                status={a.status}
                title={a.title}
                meta={a.meta}
                time={now ? relativeDay(a.at, now) : ''}
                dateTime={a.at}
                showActions={false}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
