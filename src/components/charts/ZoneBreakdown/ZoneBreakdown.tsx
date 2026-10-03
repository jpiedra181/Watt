import { formatKwh, formatShare } from '@/lib/format';
import { cn } from '@/lib/cn';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import { ZoneShareRow } from '../../data/ZoneShareRow/ZoneShareRow';

export interface ZoneBreakdownItem {
  id: string;
  name: string;
  kwh: number;
  /** 0–1 */
  share: number;
  /** Fixed series colour for the zone group. */
  color: string;
  to?: string;
}

export interface ZoneBreakdownProps {
  items: ZoneBreakdownItem[];
  loading?: boolean;
  className?: string;
}

/**
 * Figma `Chart / Zone Breakdown` (21:1398): 100% stacked bar (2px surface gaps, segments scale with
 * width) + legend rows. The rows are the accessible version — the bar itself is decorative.
 */
export function ZoneBreakdown({ items, loading, className }: ZoneBreakdownProps) {
  if (loading) {
    return (
      <div className={cn('flex flex-col gap-16', className)} aria-busy="true">
        <span className="sr-only">Loading consumption by zone</span>
        <Skeleton shape="line" width="100%" height={12} />
        <div className="flex flex-col gap-14 px-8 py-10">
          {items.length === 0 &&
            [0, 1, 2, 3, 4].map((i) => <Skeleton key={i} width={`${90 - i * 8}%`} height={10} />)}
        </div>
      </div>
    );
  }
  return (
    <div className={cn('flex flex-col gap-16', className)}>
      <div aria-hidden="true" className="flex h-12 w-full gap-2 overflow-hidden rounded-xs">
        {items.map((z) => (
          <span
            key={z.id}
            className="h-full min-w-2"
            style={{ flexGrow: z.share, flexBasis: 0, background: z.color }}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((z) => (
          <li key={z.id}>
            <ZoneShareRow
              zone={z.name}
              value={`${formatKwh(z.kwh)} kWh`}
              share={formatShare(z.share)}
              color={z.color}
              to={z.to}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
