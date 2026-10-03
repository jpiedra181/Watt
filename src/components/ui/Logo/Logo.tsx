import { cn } from '@/lib/cn';

export interface LogoProps {
  /** Full = mark + wordmark · Mark = 28px tile only. */
  variant?: 'full' | 'mark';
  className?: string;
}

/** Watt logo — Figma `Logo` (7:42). The bolt is the filled Zap glyph from the Figma asset. */
export function Logo({ variant = 'full', className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-8', className)}>
      <span
        className="flex size-28 shrink-0 items-center justify-center rounded-md bg-brand"
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8.66667 1.33333L2 9.33333H8L7.33333 14.6667L14 6.66667H8L8.66667 1.33333Z"
            fill="white"
            stroke="white"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {variant === 'full' ? (
        <span className="type-heading-section text-primary">Watt</span>
      ) : (
        <span className="sr-only">Watt</span>
      )}
    </span>
  );
}
