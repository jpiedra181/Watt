import type { ButtonHTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { IconButton } from '../IconButton/IconButton';
import { Select } from '../Select/Select';

export interface PageButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** Figma `Page Button` (14:686) — 32px, Default / Hover / Focus / Selected / Disabled. */
export function PageButton({ selected, className, children, ...props }: PageButtonProps) {
  return (
    <button
      type="button"
      aria-current={selected ? 'page' : undefined}
      className={cn(
        'inline-flex size-32 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent',
        'type-body-small-strong tabular text-secondary outline-none transition-colors duration-100',
        'not-disabled:hover:bg-hover focus-visible:border-focus focus-visible:shadow-focus-ring',
        'aria-[current=page]:bg-selected aria-[current=page]:text-brand',
        'disabled:cursor-not-allowed disabled:text-disabled',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** 1 2 3 … 5 · 1 2 [3] 4 5 · 1 … 3 4 [5] — at most 5 slots, like the Figma variants. */
export function pageItems(page: number, pageCount: number): (number | 'ellipsis')[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, 'ellipsis', pageCount];
  if (page >= pageCount - 2) return [1, 'ellipsis', pageCount - 2, pageCount - 1, pageCount];
  return [1, 'ellipsis', page, 'ellipsis', pageCount];
}

export interface PaginationProps {
  /** 1-based. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  /** Plural noun for the summary: "Showing 1–10 of 11 zones". */
  itemLabel?: string;
  className?: string;
}

/** Figma `Pagination` (14:792) — table footer: summary · rows per page · page buttons. */
export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  itemLabel = 'items',
  className,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className={cn('flex flex-wrap items-center gap-x-16 gap-y-12 bg-surface px-16 py-12', className)}>
      <p className="type-body-small tabular text-secondary" aria-live="polite">
        Showing {from}–{to} of {total} {itemLabel}
      </p>
      <div className="hidden flex-1 sm:block" />
      {onPageSizeChange && (
        <div className="flex items-center gap-8">
          <span className="type-caption text-tertiary" aria-hidden="true">
            Rows per page
          </span>
          <Select
            size="sm"
            label="Rows per page"
            hideLabel
            className="w-60"
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
            options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
          />
        </div>
      )}
      <nav aria-label="Pagination" className="ml-auto flex items-center gap-4 sm:ml-0">
        <IconButton
          icon={ChevronLeft}
          label="Previous page"
          tooltip={false}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        {pageItems(page, pageCount).map((item, i) =>
          item === 'ellipsis' ? (
            <span
              key={`e${i}`}
              aria-hidden="true"
              className="flex size-32 items-center justify-center type-body-small text-tertiary"
            >
              …
            </span>
          ) : (
            <PageButton
              key={item}
              selected={item === page}
              aria-label={`Page ${item}`}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PageButton>
          ),
        )}
        <IconButton
          icon={ChevronRight}
          label="Next page"
          tooltip={false}
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        />
      </nav>
    </div>
  );
}
