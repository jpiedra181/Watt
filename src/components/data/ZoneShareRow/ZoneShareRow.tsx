import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/cn';

export interface ZoneShareRowProps {
  zone: string;
  /** Formatted, e.g. "1,642 kWh". */
  value: string;
  /** Formatted, e.g. "34%". */
  share: string;
  color: string;
  /** Turns the row into a link to the zone. */
  to?: string;
  className?: string;
}

/** Figma `Zone Share Row` (20:1456) — swatch · zone · mono value · share. Hover → bg/hover. */
export function ZoneShareRow({ zone, value, share, color, to, className }: ZoneShareRowProps) {
  const content = (
    <>
      <span aria-hidden="true" className="size-10 shrink-0 rounded-[2px]" style={{ background: color }} />
      <span className="min-w-0 flex-1 truncate type-body-small text-primary">{zone}</span>
      <span className="type-data-mono tabular whitespace-nowrap text-primary">{value}</span>
      <span className="w-40 shrink-0 text-right type-data-mono tabular text-tertiary group-hover:text-secondary">
        <span className="sr-only">, </span>
        {share}
      </span>
    </>
  );
  const classes = cn(
    'group flex h-36 w-full items-center gap-10 rounded-sm px-8 outline-none transition-colors duration-75',
    to && 'hover:bg-hover focus-visible:shadow-focus-ring',
    className,
  );
  return to ? (
    <Link to={to} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}
