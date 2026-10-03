import { cn } from '@/lib/cn';

export interface SpinnerProps {
  /** `default` on surfaces, `on-brand` inside Primary/Destructive buttons. */
  tone?: 'default' | 'on-brand';
  /** Rendered size in px (Figma: 16; 12 inside the Toggle knob). */
  size?: number;
  /** When set, the spinner announces itself (role="status"). Leave empty when a parent already sets aria-busy. */
  label?: string;
  className?: string;
}

/** Indeterminate spinner — Figma `Spinner` (7:23). The arc turns 360° every 800ms. */
export function Spinner({ tone = 'default', size = 16, label, className }: SpinnerProps) {
  const a11y = label ? { role: 'status', 'aria-label': label } : { 'aria-hidden': true };
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      fill="none"
      className={cn('shrink-0 animate-spinner', className)}
      {...a11y}
    >
      <circle
        cx="8"
        cy="8"
        r="6"
        strokeWidth="2"
        className={
          tone === 'on-brand' ? 'stroke-icon-on-brand opacity-35' : 'stroke-[var(--color-border-default)]'
        }
      />
      <path
        d="M14 8a6 6 0 0 0-6-6"
        strokeWidth="2"
        strokeLinecap="round"
        className={tone === 'on-brand' ? 'stroke-icon-on-brand' : 'stroke-icon-brand'}
      />
    </svg>
  );
}
