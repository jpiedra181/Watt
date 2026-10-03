import type { ReactNode } from 'react';
import { CircleAlert, Ellipsis, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../../ui/Button/Button';
import { IconButton } from '../../ui/IconButton/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/Menu/DropdownMenu';
import { StatusBadge } from '../../ui/StatusBadge/StatusBadge';

export type AlertSeverity = 'critical' | 'warning';
export type AlertStatus = 'new' | 'reviewed' | 'resolved';

export interface AlertItemProps {
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  meta: string;
  /** Visible time ("19:42", "Yesterday", "Sat 27 Sep"). */
  time: string;
  /** Machine-readable timestamp for <time>. */
  dateTime?: string;
  /** Figma `Show actions`. Off in the Overview list. */
  showActions?: boolean;
  /** Primary action: Mark reviewed (new) · Resolve (reviewed) · Reopen (resolved). */
  onAction?: () => void;
  actionPending?: boolean;
  /** Extra DropdownMenu items for the "…" button. */
  menu?: ReactNode;
  className?: string;
}

export const alertActionLabel: Record<AlertStatus, string> = {
  new: 'Mark reviewed',
  reviewed: 'Resolve',
  resolved: 'Reopen',
};

const badge = {
  new: { tone: 'brand', label: 'New' },
  reviewed: { tone: 'neutral', label: 'Reviewed' },
  resolved: { tone: 'good', label: 'Resolved' },
} as const;

/**
 * Figma `Alert Item` (20:1302) · Status (New, Reviewed, Resolved) × Severity (Critical, Warning) ×
 * State (Default, Hover). Severity is spelled out for screen readers and drawn with a distinct icon,
 * not only colour. Below 640px the text wraps, the time hides and the primary action moves into "…".
 */
export function AlertItem({
  severity,
  status,
  title,
  meta,
  time,
  dateTime,
  showActions = true,
  onAction,
  actionPending,
  menu,
  className,
}: AlertItemProps) {
  const resolved = status === 'resolved';
  const SeverityIcon = severity === 'critical' ? CircleAlert : TriangleAlert;
  const { tone, label } = badge[status];

  return (
    <div
      className={cn(
        'group flex items-center gap-12 border-b border-subtle bg-surface px-16 py-12 transition-colors duration-75 hover:bg-hover max-sm:items-start',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-8 shrink-0 rounded-full max-sm:mt-6',
          status === 'new' ? 'bg-brand' : 'bg-transparent',
        )}
      />
      <span
        className={cn(
          'flex size-36 shrink-0 items-center justify-center rounded-md',
          resolved
            ? 'bg-subtle text-icon-secondary'
            : severity === 'critical'
              ? 'bg-critical-subtle text-critical'
              : 'bg-warning-subtle text-warning',
        )}
      >
        <SeverityIcon size={18} aria-hidden="true" />
        <span className="sr-only">{severity === 'critical' ? 'Critical' : 'Warning'}:</span>
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className={cn('type-body-small-strong sm:truncate', resolved ? 'text-secondary' : 'text-primary')}>
          {title}
        </p>
        <p className="type-caption text-tertiary group-hover:text-secondary sm:truncate">{meta}</p>
      </div>
      <time
        dateTime={dateTime}
        className="shrink-0 type-caption tabular whitespace-nowrap text-tertiary group-hover:text-secondary max-sm:sr-only"
      >
        {time}
      </time>
      <StatusBadge tone={tone}>{label}</StatusBadge>
      {showActions && (
        <div className="flex shrink-0 items-center gap-4">
          <Button
            variant={resolved ? 'ghost' : 'secondary'}
            onClick={onAction}
            loading={actionPending}
            aria-label={`${alertActionLabel[status]}: ${title}`}
            className="max-sm:hidden"
          >
            {alertActionLabel[status]}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                icon={Ellipsis}
                label={`More actions for ${title}`}
                tooltip={false}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={onAction} className="sm:hidden">
                {alertActionLabel[status]}
              </DropdownMenuItem>
              {menu}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
