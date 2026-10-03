import type { ComponentProps, ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Skeleton } from '../../ui/Skeleton/Skeleton';

/** Semantic table primitives styled after Figma `Table Header Cell` (14:472) and `Table Row` (14:652). */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return <table className={cn('w-full border-collapse text-left', className)} {...props} />;
}

export function TableHead(props: ComponentProps<'thead'>) {
  return <thead {...props} />;
}

export function TableBody(props: ComponentProps<'tbody'>) {
  return <tbody {...props} />;
}

export type SortDirection = 'asc' | 'desc' | false;

export interface TableHeaderCellProps extends Omit<ComponentProps<'th'>, 'align'> {
  align?: 'left' | 'right';
  /** Omit for non-sortable columns. */
  sort?: SortDirection;
  onSort?: () => void;
  width?: number | string;
}

/**
 * 40px, bg/subtle, Caption/Strong. Sortable headers are buttons inside the <th>, which carries
 * aria-sort; the icon goes ChevronsUpDown → ArrowUp → ArrowDown.
 */
export function TableHeaderCell({
  align = 'left',
  sort,
  onSort,
  width,
  className,
  children,
  style,
  ...props
}: TableHeaderCellProps) {
  const sortable = sort !== undefined && onSort;
  const SortIcon = sort === 'asc' ? ArrowUp : sort === 'desc' ? ArrowDown : ChevronsUpDown;
  return (
    <th
      scope="col"
      aria-sort={
        sortable ? (sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none') : undefined
      }
      style={{ width, ...style }}
      className={cn(
        'h-40 border-b border-default bg-subtle px-12 align-middle type-caption-strong whitespace-nowrap',
        sort ? 'text-primary' : 'text-secondary',
        align === 'right' && 'text-right',
        sortable && 'has-[button:hover]:bg-hover',
        className,
      )}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={cn(
            'group -mx-4 inline-flex cursor-pointer items-center gap-4 rounded-xs px-4 py-2 outline-none focus-visible:shadow-focus-ring',
            align === 'right' && 'flex-row',
          )}
        >
          {children}
          <SortIcon
            size={14}
            aria-hidden="true"
            className={cn(
              'shrink-0',
              sort ? 'text-icon-primary' : 'text-icon-disabled group-hover:text-icon-secondary',
            )}
          />
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export interface TableRowProps extends ComponentProps<'tr'> {
  selected?: boolean;
}

/**
 * 56px row, border-subtle divider. Hover → bg/hover · Selected → bg/selected ·
 * Focus → 2px border/focus outline whenever the row's link has keyboard focus.
 */
export function TableRow({ selected, className, ...props }: TableRowProps) {
  return (
    <tr
      data-selected={selected || undefined}
      className={cn(
        'group/row h-56 border-b border-subtle bg-surface transition-colors duration-75',
        'hover:bg-hover data-[selected]:bg-selected data-[selected]:hover:bg-selected-hover',
        'has-[.row-link:focus-visible]:outline-2 has-[.row-link:focus-visible]:-outline-offset-2 has-[.row-link:focus-visible]:outline-focus',
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({
  align = 'left',
  className,
  ...props
}: Omit<ComponentProps<'td'>, 'align'> & { align?: 'left' | 'right' }) {
  return <td className={cn('px-12 align-middle', align === 'right' && 'text-right', className)} {...props} />;
}

/** Loading row — Figma `Table Row · State=Loading`. One skeleton per column width. */
export function TableSkeletonRow({ cells }: { cells: ReactNode[] }) {
  return (
    <tr className="h-56 border-b border-subtle bg-surface" aria-hidden="true">
      {cells.map((c, i) => (
        <td key={i} className="px-12 align-middle">
          {c}
        </td>
      ))}
    </tr>
  );
}

export { Skeleton as TableSkeleton };
