import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const badge = cva(
  'inline-flex shrink-0 items-center gap-6 whitespace-nowrap rounded-full border px-8 py-2 type-caption-strong',
  {
    variants: {
      tone: {
        good: 'border-good-subtle bg-good-subtle text-good',
        warning: 'border-warning-subtle bg-warning-subtle text-warning',
        critical: 'border-critical-subtle bg-critical-subtle text-critical',
        brand: 'border-transparent bg-brand-subtle text-brand',
        neutral: 'border-default bg-subtle text-secondary',
      },
    },
    defaultVariants: { tone: 'good' },
  },
);

const dot = {
  good: 'bg-good-solid',
  warning: 'bg-warning-solid',
  critical: 'bg-critical-solid',
  brand: 'bg-brand',
  neutral: 'bg-[var(--color-icon-secondary)]',
} as const;

export interface StatusBadgeProps extends VariantProps<typeof badge> {
  children: ReactNode;
  /** Figma `Show dot`. The label always carries the meaning, the dot is decorative. */
  showDot?: boolean;
  className?: string;
}

/**
 * Figma `Status Badge` (7:87). Consumption state: Good = Normal, Warning = Attention,
 * Critical = Alert. Alert workflow: Brand = New, Neutral = Reviewed, Good = Resolved.
 */
export function StatusBadge({ tone = 'good', showDot = true, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(badge({ tone }), className)}>
      {showDot && (
        <span aria-hidden="true" className={cn('size-6 shrink-0 rounded-full', dot[tone ?? 'good'])} />
      )}
      {children}
    </span>
  );
}
