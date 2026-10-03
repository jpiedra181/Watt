import { CircleAlert, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LegendSwatch } from '../../ui/LegendItem/LegendItem';

export interface ChartTooltipRow {
  label: string;
  value: string;
  color: string;
  swatch?: 'square' | 'line' | 'dashed';
}

export interface ChartTooltipProps {
  title: string;
  rows: ChartTooltipRow[];
  /** Optional state row under a divider, e.g. "Over contract · +7.4 kW". */
  note?: { tone: 'warning' | 'critical'; text: string };
  className?: string;
}

/** Figma `Chart Tooltip` (13:376): time, series rows (swatch + label + mono value), optional state row. */
export function ChartTooltip({ title, rows, note, className }: ChartTooltipProps) {
  const NoteIcon = note?.tone === 'critical' ? CircleAlert : TriangleAlert;
  return (
    <div
      className={cn(
        'flex w-[220px] flex-col gap-8 rounded-md border border-default bg-surface-raised p-12 shadow-elevation-2',
        className,
      )}
    >
      <p className="type-caption-strong text-secondary">{title}</p>
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-8">
          <span className="flex w-12 shrink-0 justify-center">
            <LegendSwatch shape={r.swatch} color={r.color} width={12} />
          </span>
          <span className="min-w-0 flex-1 truncate type-caption text-secondary">{r.label}</span>
          <span className="type-data-mono-strong tabular whitespace-nowrap text-primary">{r.value}</span>
        </div>
      ))}
      {note && (
        <>
          <hr className="border-0 border-t border-subtle" />
          <p
            className={cn(
              'flex items-center gap-6 type-caption-strong',
              note.tone === 'critical' ? 'text-critical' : 'text-warning',
            )}
          >
            <NoteIcon size={14} aria-hidden="true" className="shrink-0" />
            {note.text}
          </p>
        </>
      )}
    </div>
  );
}
