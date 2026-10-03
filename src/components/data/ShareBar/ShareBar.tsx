import { cn } from '@/lib/cn';

export interface ShareBarProps {
  /** 0–1 */
  share: number;
  /** Zone series colour token, e.g. var(--color-chart-series-2). */
  color: string;
  className?: string;
}

/** The 96×6 share track used in the Zones table (Figma Table Row › cell/share). Decorative. */
export function ShareBar({ share, color, className }: ShareBarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('block h-6 w-96 shrink-0 overflow-hidden rounded-full bg-hover', className)}
    >
      <span
        className="block h-full rounded-full"
        style={{ width: `${Math.max(2, Math.min(100, share * 100))}%`, background: color }}
      />
    </span>
  );
}
