import type { ReactNode } from 'react';
import { CircleAlert, Inbox, Search, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface EmptyStateProps {
  /** Figma `Variant`: No data, No results, Error. */
  variant?: 'no-data' | 'no-results' | 'error';
  title: ReactNode;
  description?: ReactNode;
  /** Figma `Show action` — usually a Button. */
  action?: ReactNode;
  icon?: LucideIcon;
  /** Compact = no vertical padding, for use inside charts and cards. */
  compact?: boolean;
  className?: string;
}

const icons = { 'no-data': Inbox, 'no-results': Search, error: CircleAlert } as const;

/** Figma `Empty State` (20:658). Errors are announced (role="alert"); the others are plain status text. */
export function EmptyState({
  variant = 'no-data',
  title,
  description,
  action,
  icon,
  compact,
  className,
}: EmptyStateProps) {
  const Icon = icon ?? icons[variant];
  const error = variant === 'error';
  return (
    <div
      role={error ? 'alert' : undefined}
      className={cn(
        'flex flex-col items-center gap-12 text-center',
        compact ? 'px-16' : 'px-24 py-40',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-48 shrink-0 items-center justify-center rounded-full',
          error ? 'bg-critical-subtle text-critical' : 'bg-subtle text-icon-secondary',
        )}
      >
        <Icon size={24} />
      </span>
      <p className="type-heading-subsection text-primary">{title}</p>
      {description && <p className="max-w-[320px] type-body-small text-secondary">{description}</p>}
      {action && <div className="flex flex-wrap justify-center gap-8 pt-4">{action}</div>}
    </div>
  );
}
