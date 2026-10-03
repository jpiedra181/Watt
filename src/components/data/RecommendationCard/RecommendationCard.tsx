import { useId } from 'react';
import { Lightbulb, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../../ui/Button/Button';
import { StatusBadge } from '../../ui/StatusBadge/StatusBadge';

export interface RecommendationCardProps {
  title: string;
  description: string;
  /** Savings pill, e.g. "−186 kWh / mo" or "−12% peak". */
  savings: string;
  /** Footer estimate for open recommendations, e.g. "≈ € 41 / month". */
  estimate?: string;
  /** Figma `State`: Default/Hover are CSS; Applied is data. */
  status?: 'open' | 'applied';
  /** Footer text when applied, e.g. "Applied 2 Oct · tracking savings". */
  appliedNote?: string;
  onApply?: () => void;
  onDismiss?: () => void;
  onUndo?: () => void;
  pending?: 'apply' | 'dismiss' | 'undo';
  /** Heading level for the title inside its section. */
  headingLevel?: 'h3' | 'h4';
  className?: string;
}

/** Figma `Recommendation Card` (20:1429) · Default, Hover, Applied. */
export function RecommendationCard({
  title,
  description,
  savings,
  estimate,
  status = 'open',
  appliedNote,
  onApply,
  onDismiss,
  onUndo,
  pending,
  headingLevel: H = 'h3',
  className,
}: RecommendationCardProps) {
  const id = useId();
  const applied = status === 'applied';
  return (
    <article
      aria-labelledby={id}
      className={cn(
        'flex min-w-0 flex-col gap-12 rounded-lg border border-default p-20 transition-[border-color,box-shadow] duration-100',
        applied ? 'bg-subtle' : 'bg-surface hover:border-strong hover:shadow-elevation-1',
        className,
      )}
    >
      <header className="flex items-center gap-8">
        <span
          aria-hidden="true"
          className={cn(
            'flex size-32 shrink-0 items-center justify-center rounded-md',
            applied ? 'bg-hover text-icon-secondary' : 'bg-brand-subtle text-icon-brand',
          )}
        >
          <Lightbulb size={16} />
        </span>
        <span className="flex-1" />
        <span className="inline-flex items-center gap-4 rounded-full bg-good-subtle px-8 py-2 type-caption-strong whitespace-nowrap text-good">
          <TrendingDown size={14} aria-hidden="true" />
          <span className="sr-only">Saves </span>
          {savings}
        </span>
      </header>
      <H id={id} className={cn('type-body-strong', applied ? 'text-secondary' : 'text-primary')}>
        {title}
      </H>
      <p className="type-body-small text-secondary">{description}</p>
      <footer className="flex flex-wrap items-center gap-8 pt-4">
        {applied ? (
          <>
            <p className="min-w-0 flex-1 type-caption-strong text-secondary">{appliedNote}</p>
            <StatusBadge tone="good">Applied</StatusBadge>
            <Button
              variant="ghost"
              onClick={onUndo}
              loading={pending === 'undo'}
              aria-label={`Undo: ${title}`}
            >
              Undo
            </Button>
          </>
        ) : (
          <>
            <p className="min-w-0 flex-1 type-caption-strong text-secondary">{estimate}</p>
            <Button
              variant="ghost"
              onClick={onDismiss}
              loading={pending === 'dismiss'}
              aria-label={`Dismiss: ${title}`}
            >
              Dismiss
            </Button>
            <Button
              variant="secondary"
              onClick={onApply}
              loading={pending === 'apply'}
              aria-label={`Apply: ${title}`}
            >
              Apply
            </Button>
          </>
        )}
      </footer>
    </article>
  );
}
