import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps {
  /** Figma `Shape`: Line (12px pill), Block (radius/md), Circle. */
  shape?: 'line' | 'block' | 'circle';
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
}

const defaults = {
  line: { width: 160, height: 12 },
  block: { width: 160, height: 72 },
  circle: { width: 32, height: 32 },
} as const;

/**
 * Loading placeholder — Figma `Skeleton` (7:169). Purely decorative: the region that is loading
 * carries aria-busy and an accessible label instead.
 */
export function Skeleton({ shape = 'line', width, height, className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'skeleton block shrink-0 animate-shimmer',
        shape === 'block' ? 'rounded-md' : 'rounded-full',
        className,
      )}
      style={{ width: width ?? defaults[shape].width, height: height ?? defaults[shape].height }}
    />
  );
}
