import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/cn';

const FILE = 'https://www.figma.com/design/xRB9FSPYbdup5v6rJz4R9F/Dashboard---Watt';

/** `parameters.design` for @storybook/addon-designs — opens the Figma node in the Design tab. */
export const figma = (nodeId: string) => ({
  design: { type: 'figma' as const, url: `${FILE}?node-id=${nodeId.replace(':', '-')}` },
});

/**
 * Forces CSS states inside "All states" stories (storybook-addon-pseudo-states).
 * Mark a cell with `data-demo="hover" | "focus" | "pressed"` and the matching element gets the state.
 */
export const pseudoStates = (target = '') => ({
  pseudo: {
    hover: [`[data-demo='hover'] ${target}`.trim()],
    focusVisible: [`[data-demo='focus'] ${target}`.trim()],
    focusWithin: [`[data-demo='focus'] ${target}`.trim()],
    active: [`[data-demo='pressed'] ${target}`.trim()],
  },
});

export interface StateGridProps {
  columns: string[];
  rows: { label?: string; cells: ReactNode[] }[];
  /** Cell min width in px. */
  cellWidth?: number;
}

const frame = 'rounded-lg border border-dashed border-strong bg-subtle p-24';

/**
 * Variant × state matrix laid out like the grids on the Figma Components page. A single unlabelled
 * row becomes a wrapping gallery, so wide components (cards, inputs) still fit the canvas.
 */
export function StateGrid({ columns, rows, cellWidth = 120 }: StateGridProps) {
  const hasRowLabels = rows.some((r) => r.label);
  const [first] = rows;
  if (rows.length === 1 && first && !hasRowLabels) {
    return (
      <div className={cn(frame, 'flex w-fit max-w-full flex-wrap gap-x-24 gap-y-24')}>
        {first.cells.map((cell, i) => (
          <div key={i} className="flex flex-col gap-16" style={{ minWidth: cellWidth }}>
            <span className="type-label-overline text-tertiary">{columns[i]}</span>
            <div data-demo={stateOf(columns[i])} className="flex items-center">
              {cell}
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div
      className={cn(frame, 'grid w-max items-center gap-x-24 gap-y-16')}
      style={{
        gridTemplateColumns: `${hasRowLabels ? 'max-content ' : ''}repeat(${columns.length}, minmax(${cellWidth}px, max-content))`,
      }}
    >
      {hasRowLabels && <span />}
      {columns.map((c) => (
        <span key={c} className="type-label-overline text-tertiary">
          {c}
        </span>
      ))}
      {rows.map((row, r) => (
        <Row key={r} label={row.label} hasRowLabels={hasRowLabels} cells={row.cells} columns={columns} />
      ))}
    </div>
  );
}

function Row({
  label,
  hasRowLabels,
  cells,
  columns,
}: {
  label?: string;
  hasRowLabels: boolean;
  cells: ReactNode[];
  columns: string[];
}) {
  return (
    <>
      {hasRowLabels && <span className="type-caption-strong text-secondary">{label}</span>}
      {cells.map((cell, i) => (
        <div key={i} data-demo={stateOf(columns[i])} className="flex items-center">
          {cell}
        </div>
      ))}
    </>
  );
}

const stateOf = (column?: string) => {
  const c = column?.toLowerCase();
  return c === 'hover' || c === 'focus' || c === 'pressed' ? c : undefined;
};

/**
 * Meta-level decorator that frames single-component stories (fixed width, border…) like the Figma
 * frame. Matrix stories opt out with `parameters.fullWidth`: a story-level decorator can't remove a
 * meta-level one, it only nests inside it.
 */
export const withFrame =
  (className: string) => (Story: () => ReactElement, ctx: { parameters: Record<string, unknown> }) =>
    ctx.parameters.fullWidth ? (
      <Story />
    ) : (
      <div className={className}>
        <Story />
      </div>
    );

/** `withFrame` with a fixed width. */
export const withWidth =
  (width: number) => (Story: () => ReactElement, ctx: { parameters: Record<string, unknown> }) =>
    ctx.parameters.fullWidth ? (
      <Story />
    ) : (
      <div style={{ width }}>
        <Story />
      </div>
    );

/** Neutral frame for a story that needs a surface behind it (cards, menus). */
export function Surface({ children, width }: { children: ReactNode; width?: number }) {
  return (
    <div className="rounded-lg border border-default bg-surface p-16" style={{ width }}>
      {children}
    </div>
  );
}
