import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface DeltaProps {
  /** Formatted absolute change, e.g. "6.1%". */
  value: string;
  direction: 'up' | 'down';
  /**
   * Good or bad news for the reader. Consumption going up is Negative; savings going up is Positive.
   * Neutral when the change is too small to matter.
   */
  sentiment: 'positive' | 'negative' | 'neutral';
  className?: string;
}

const tone = {
  positive: 'bg-good-subtle text-good',
  negative: 'bg-critical-subtle text-critical',
  neutral: 'bg-subtle text-secondary',
} as const;

/** Change pill — Figma `Delta` (7:151). Direction is spelled out for screen readers, not only drawn. */
export function Delta({ value, direction, sentiment, className }: DeltaProps) {
  const Arrow = direction === 'up' ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-6 py-2 type-caption-strong',
        tone[sentiment],
        className,
      )}
    >
      <Arrow size={14} aria-hidden="true" />
      <span className="sr-only">{direction === 'up' ? 'up' : 'down'} </span>
      {value}
    </span>
  );
}
