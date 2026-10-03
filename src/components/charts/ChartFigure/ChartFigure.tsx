import { useId, useState, type ReactNode } from 'react';
import { RefreshCw, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '../../ui/Button/Button';

export interface ChartTableColumn<Row> {
  header: string;
  cell: (row: Row) => ReactNode;
  align?: 'left' | 'right';
}

export interface ChartFigureProps<Row> {
  /** Text alternative for the drawing: what a sighted reader takes away from it. */
  summary: string;
  /** Legend row above the plot. */
  legend?: ReactNode;
  /** The chart itself. It is exposed as one image with `summary` as its name. */
  children: ReactNode;
  /** Rows for the data-table alternative. */
  table: { caption: string; columns: ChartTableColumn<Row>[]; rows: Row[]; rowKey: (row: Row) => string };
  /** Controlled table visibility (e.g. from the card's "…" menu). Uncontrolled when omitted. */
  showTable?: boolean;
  onShowTableChange?: (show: boolean) => void;
  /** Message drawn over the empty plot (empty / error state). */
  overlay?: ReactNode;
  className?: string;
}

/**
 * Accessible wrapper used by every Watt chart:
 * - the SVG is a single `role="img"` with a written summary (no focus traps inside),
 * - a "Show data table" button — visually hidden until focused, so the Figma layout is unchanged —
 *   reveals a real <table> with every value,
 * - colours come from chart tokens and are never the only cue (labels, line styles, state rows).
 */
export function ChartFigure<Row>({
  summary,
  legend,
  children,
  table,
  showTable,
  onShowTableChange,
  overlay,
  className,
}: ChartFigureProps<Row>) {
  const [internal, setInternal] = useState(false);
  const open = showTable ?? internal;
  const setOpen = (v: boolean) => (onShowTableChange ? onShowTableChange(v) : setInternal(v));
  const tableId = useId();

  return (
    <figure className={cn('relative m-0 flex min-w-0 flex-col gap-12', className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={tableId}
        onClick={() => setOpen(!open)}
        className={cn(
          'self-start rounded-xs type-caption-strong text-brand outline-none focus-visible:shadow-focus-ring',
          !open && 'sr-only focus:not-sr-only',
        )}
      >
        {open ? 'Hide data table' : 'Show data table'}
      </button>
      {legend}
      <div className="relative">
        <div role="img" aria-label={summary}>
          {children}
        </div>
        {overlay && <div className="absolute inset-0 flex items-center justify-center pb-24">{overlay}</div>}
      </div>
      <div
        id={tableId}
        hidden={!open}
        className="max-h-[320px] overflow-auto rounded-md border border-default"
      >
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{table.caption}</caption>
          <thead className="sticky top-0 bg-subtle">
            <tr>
              {table.columns.map((c) => (
                <th
                  key={c.header}
                  scope="col"
                  className={cn(
                    'h-32 border-b border-default px-12 type-caption-strong text-secondary',
                    c.align === 'right' && 'text-right',
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={table.rowKey(row)} className="border-b border-subtle last:border-0">
                {table.columns.map((c, i) => {
                  const Cell = i === 0 ? 'th' : 'td';
                  return (
                    <Cell
                      key={c.header}
                      {...(i === 0 ? { scope: 'row' } : {})}
                      className={cn(
                        'h-32 px-12 text-primary',
                        i === 0 ? 'type-caption' : 'type-data-mono tabular',
                        c.align === 'right' && 'text-right',
                      )}
                    >
                      {c.cell(row)}
                    </Cell>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* The summary also lives in the document flow for "read all" modes. */}
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  );
}

export interface ChartMessageProps {
  icon: LucideIcon;
  tone?: 'neutral' | 'critical';
  title: string;
  description?: string;
  onRetry?: () => void;
}

/** Empty / error message drawn inside a chart's plot area (Figma chart `State=Empty|Error`). */
export function ChartMessage({
  icon: Icon,
  tone = 'neutral',
  title,
  description,
  onRetry,
}: ChartMessageProps) {
  return (
    <div
      role={tone === 'critical' ? 'alert' : undefined}
      className="flex max-w-[320px] flex-col items-center gap-6 px-16 text-center"
    >
      <Icon
        size={20}
        aria-hidden="true"
        className={tone === 'critical' ? 'text-critical' : 'text-icon-secondary'}
      />
      <p className="mt-2 type-body-small-strong text-primary">{title}</p>
      {description && <p className="type-caption text-tertiary">{description}</p>}
      {onRetry && (
        <Button variant="secondary" leadingIcon={RefreshCw} onClick={onRetry} className="mt-6">
          Retry
        </Button>
      )}
    </div>
  );
}
