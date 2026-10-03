import { useId } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import { CircleAlert, Info, RefreshCw, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Delta, type DeltaProps } from '../../ui/Delta/Delta';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { Sparkline } from '../Sparkline/Sparkline';

export interface KpiCardProps {
  label: string;
  /** Shorter label used below 640px (Figma mobile: "Consumption"). */
  shortLabel?: string;
  icon: LucideIcon;
  /** What the number means — shown in the info tooltip. */
  info?: string;
  /** Figma `State`: Default/Hover/Focus are CSS; Loading, Empty and Error come from the query. */
  status?: 'ready' | 'loading' | 'empty' | 'error';
  value?: string;
  unit?: string;
  delta?: DeltaProps;
  /** "vs August" (short form "vs Aug" on mobile). */
  comparison?: string;
  shortComparison?: string;
  trend?: number[];
  /** Makes the whole card a link (stretched over the label). */
  to?: LinkProps['to'];
  search?: LinkProps['search'];
  emptyText?: string;
  errorText?: string;
  errorDetail?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Figma `KPI Card` (14:391) · 280px min · States: Default, Hover, Focus, Loading, Empty, Error.
 * Delta sentiment: consumption up = Negative, savings up = Positive.
 */
export function KpiCard({
  label,
  shortLabel,
  icon: Icon,
  info,
  status = 'ready',
  value,
  unit,
  delta,
  comparison,
  shortComparison,
  trend,
  to,
  search,
  emptyText = 'No readings for this period',
  errorText = 'Couldn’t load data',
  errorDetail,
  onRetry,
  className,
}: KpiCardProps) {
  const labelId = useId();
  const loading = status === 'loading';
  const interactive = Boolean(to) && status === 'ready';

  const labelText = (
    <>
      <span className={cn(shortLabel && 'max-sm:hidden')}>{label}</span>
      {shortLabel && <span className="sm:hidden">{shortLabel}</span>}
    </>
  );

  return (
    <article
      aria-labelledby={labelId}
      aria-busy={loading || undefined}
      className={cn(
        'relative flex min-w-0 flex-col gap-16 rounded-lg border border-default bg-surface p-16 sm:min-h-162 sm:p-20',
        'transition-[border-color,box-shadow] duration-100',
        interactive && 'hover:border-strong hover:shadow-elevation-1',
        interactive && 'has-[a:focus-visible]:border-focus has-[a:focus-visible]:shadow-focus-ring',
        className,
      )}
    >
      <header className="flex min-h-18 items-center gap-8 sm:min-h-28">
        {loading ? (
          <>
            <Skeleton shape="circle" width={28} height={28} className="max-sm:hidden" />
            <Skeleton width={120} height={10} />
            <span id={labelId} className="sr-only">
              Loading {label}
            </span>
          </>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="flex size-28 shrink-0 items-center justify-center rounded-md bg-subtle text-icon-secondary max-sm:hidden"
            >
              <Icon size={16} />
            </span>
            <h3 id={labelId} className="min-w-0 flex-1 truncate type-body-small-strong text-secondary">
              {interactive ? (
                <Link
                  to={to}
                  search={search}
                  className="outline-none after:absolute after:inset-0 after:rounded-lg"
                >
                  {labelText}
                </Link>
              ) : (
                labelText
              )}
            </h3>
            {info && (
              <Tooltip content={info}>
                <button
                  type="button"
                  aria-label={`About ${label.toLowerCase()}`}
                  className="relative z-10 -m-4 flex size-24 shrink-0 cursor-help items-center justify-center rounded-sm text-icon-secondary outline-none hover:text-icon-primary focus-visible:shadow-focus-ring max-sm:hidden"
                >
                  <Info size={16} aria-hidden="true" />
                </button>
              </Tooltip>
            )}
          </>
        )}
      </header>

      {status === 'error' ? (
        <>
          <div className="flex min-h-36 items-center gap-8" role="alert">
            <CircleAlert size={18} aria-hidden="true" className="shrink-0 text-critical" />
            <p className="type-body-strong text-primary">{errorText}</p>
          </div>
          <footer className="mt-auto flex flex-wrap items-center gap-8">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="relative z-10 -mx-4 inline-flex items-center gap-4 rounded-sm px-4 type-caption-strong text-brand outline-none hover:underline focus-visible:shadow-focus-ring"
              >
                <RefreshCw size={14} aria-hidden="true" />
                Retry
              </button>
            )}
            {errorDetail && <p className="type-caption text-tertiary">{errorDetail}</p>}
          </footer>
        </>
      ) : (
        <>
          <div className="flex min-h-36 items-baseline gap-4 overflow-hidden whitespace-nowrap">
            {loading ? (
              <Skeleton shape="block" width={140} height={32} />
            ) : status === 'empty' ? (
              <p className="type-data-kpi text-tertiary">
                —<span className="sr-only">no value</span>
              </p>
            ) : (
              <p className="flex items-baseline gap-4">
                <span className="type-data-kpi tabular text-primary">{value}</span>
                {unit && <span className="type-body text-tertiary">{unit}</span>}
              </p>
            )}
          </div>
          <footer className="mt-auto flex min-h-24 items-center gap-8">
            {loading ? (
              <>
                <Skeleton width={96} height={10} />
                <span className="flex-1" />
                <Skeleton shape="block" width={72} height={24} className="max-sm:hidden" />
              </>
            ) : status === 'empty' ? (
              <p className="type-caption text-tertiary">{emptyText}</p>
            ) : (
              <>
                {delta && <Delta {...delta} />}
                {comparison && (
                  <p className="min-w-0 flex-1 truncate type-caption text-tertiary">
                    <span className={cn(shortComparison && 'max-sm:hidden')}>{comparison}</span>
                    {shortComparison && <span className="sm:hidden">{shortComparison}</span>}
                  </p>
                )}
                {trend && <Sparkline values={trend} className="max-sm:hidden" />}
              </>
            )}
          </footer>
        </>
      )}
    </article>
  );
}
