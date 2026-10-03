import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface LegendItemProps {
  /** Square = bars/areas · Line = solid series · Dashed = reference or previous period. */
  shape?: 'square' | 'line' | 'dashed';
  /** Any chart token, e.g. `var(--color-chart-series-1)`. */
  color: string;
  children: ReactNode;
  className?: string;
}

/** Chart legend entry — Figma `Legend Item` (7:190). */
export function LegendItem({ shape = 'square', color, children, className }: LegendItemProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-6 whitespace-nowrap type-caption text-secondary',
        className,
      )}
    >
      <LegendSwatch shape={shape} color={color} />
      {children}
    </span>
  );
}

export function LegendSwatch({
  shape = 'square',
  color,
  width = 16,
}: {
  shape?: LegendItemProps['shape'];
  color: string;
  width?: number;
}) {
  if (shape === 'square') {
    return (
      <span aria-hidden="true" className="size-10 shrink-0 rounded-[2px]" style={{ background: color }} />
    );
  }
  return (
    <svg aria-hidden="true" width={width} height="2" viewBox={`0 0 ${width} 2`} className="shrink-0">
      <line
        x1="0"
        y1="1"
        x2={width}
        y2="1"
        stroke={color}
        strokeWidth="2"
        strokeDasharray={shape === 'dashed' ? '3 2' : undefined}
      />
    </svg>
  );
}
