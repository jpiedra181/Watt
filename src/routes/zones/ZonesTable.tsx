import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { Download, Ellipsis, Eye, SlidersHorizontal } from 'lucide-react';
import type { ZoneRow } from '@/api/schemas';
import { ShareBar } from '@/components/data/ShareBar/ShareBar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableSkeletonRow,
} from '@/components/data/Table/Table';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { Delta } from '@/components/ui/Delta/Delta';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/Menu/DropdownMenu';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { cn } from '@/lib/cn';
import { formatEuro, formatKwh, formatPercent, formatShare } from '@/lib/format';
import { consumptionDelta, zoneIcon, zoneStatus, zoneTypeColor } from '@/lib/zones';

const col = createColumnHelper<ZoneRow>();

export interface ZonesTableProps {
  rows: ZoneRow[];
  loading: boolean;
  /** Showing the previous page while the next one loads. */
  stale: boolean;
  sort: string;
  onSortChange: (sort: string) => void;
  selected: Set<string>;
  onSelectedChange: (ids: Set<string>) => void;
  previousMonth: string;
  onSetThreshold: (row: ZoneRow) => void;
  onExport: (rows: ZoneRow[]) => void;
}

const SORT_LABEL: Record<string, string> = {
  zone: 'zone name',
  status: 'status',
  consumption: 'consumption',
  change: 'change',
  cost: 'cost',
};

/**
 * Figma Zones table — TanStack Table in manual mode: the API sorts, filters and paginates, the table
 * renders state that lives in the URL. Columns: select 48 · zone · status 132 · consumption 136 ·
 * delta 128 · cost 112 · share 168 · actions 56.
 */
export function ZonesTable({
  rows,
  loading,
  stale,
  sort,
  onSortChange,
  selected,
  onSelectedChange,
  previousMonth,
  onSetThreshold,
  onExport,
}: ZonesTableProps) {
  const [sortKey, sortDir] = sort.split('.') as [string, 'asc' | 'desc'];
  const sorting: SortingState = [{ id: sortKey, desc: sortDir === 'desc' }];
  const rowSelection: RowSelectionState = useMemo(
    () => Object.fromEntries([...selected].map((id) => [id, true])),
    [selected],
  );
  // Figma tablet: Cost and Share drop out below 1280px so the zone name keeps its room.
  const wide = useMediaQuery('(min-width: 1280px)');
  const columnVisibility = { cost: wide, share: wide };

  const columns = useMemo(
    () => [
      col.display({
        id: 'select',
        size: 48,
        header: ({ table }) => (
          <Checkbox
            label="Select all zones on this page"
            hideLabel
            checked={
              table.getIsAllPageRowsSelected()
                ? true
                : table.getIsSomePageRowsSelected()
                  ? 'indeterminate'
                  : false
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            label={`Select ${row.original.name}`}
            hideLabel
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(v)}
          />
        ),
      }),
      col.accessor('name', {
        id: 'zone',
        header: 'Zone',
        enableSorting: true,
        cell: ({ row }) => {
          const z = row.original;
          const Icon = zoneIcon[z.icon];
          return (
            <span className="flex min-w-0 items-center gap-8">
              <span
                aria-hidden="true"
                className="flex size-32 shrink-0 items-center justify-center rounded-md bg-subtle text-icon-secondary"
              >
                <Icon size={16} />
              </span>
              <span className="flex min-w-0 flex-col">
                <Link
                  to="/zones/$type"
                  params={{ type: z.type }}
                  className="row-link truncate type-body-small-strong text-primary outline-none hover:underline"
                >
                  {z.name}
                </Link>
                <span className="truncate type-caption text-tertiary group-hover/row:text-secondary group-data-[selected]/row:text-secondary">
                  {z.detail}
                </span>
              </span>
            </span>
          );
        },
      }),
      col.accessor('status', {
        header: 'Status',
        size: 132,
        cell: ({ getValue }) => {
          const s = zoneStatus[getValue()];
          return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
        },
      }),
      col.accessor('kwh', {
        id: 'consumption',
        header: 'Consumption',
        size: 136,
        meta: { align: 'right' },
        cell: ({ getValue }) => (
          <span className="type-data-mono-strong tabular whitespace-nowrap text-primary">
            {formatKwh(getValue())} kWh
          </span>
        ),
      }),
      col.display({
        id: 'change',
        header: `vs ${previousMonth}`,
        size: 128,
        meta: { align: 'right' },
        cell: ({ row }) => {
          const d = consumptionDelta(row.original.kwh, row.original.previousKwh);
          return <Delta value={formatPercent(d.change)} direction={d.direction} sentiment={d.sentiment} />;
        },
      }),
      col.accessor('cost', {
        header: 'Cost',
        size: 112,
        meta: { align: 'right' },
        cell: ({ getValue }) => (
          <span className="type-data-mono tabular whitespace-nowrap text-secondary">
            € {formatEuro(getValue())}
          </span>
        ),
      }),
      col.accessor('share', {
        header: 'Share',
        size: 168,
        enableSorting: false,
        cell: ({ row }) => (
          <span className="flex items-center gap-8">
            <ShareBar share={row.original.share} color={zoneTypeColor[row.original.type]} />
            <span className="type-data-mono tabular text-secondary">{formatShare(row.original.share)}</span>
          </span>
        ),
      }),
      col.display({
        id: 'actions',
        size: 56,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton
                variant="ghost"
                icon={Ellipsis}
                label={`Actions for ${row.original.name}`}
                tooltip={false}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem icon={Eye} asChild>
                <Link to="/zones/$type" params={{ type: row.original.type }}>
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem icon={SlidersHorizontal} onSelect={() => onSetThreshold(row.original)}>
                Set threshold…
              </DropdownMenuItem>
              <DropdownMenuItem icon={Download} onSelect={() => onExport([row.original])}>
                Export CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      }),
    ],
    [previousMonth, onSetThreshold, onExport],
  );

  // TanStack Table returns non-memoizable functions; this app doesn't use the React Compiler.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    getRowId: (r) => r.id,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    manualFiltering: true,
    enableSortingRemoval: false,
    enableRowSelection: true,
    state: { sorting, rowSelection, columnVisibility },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      const s = next[0];
      if (s) onSortChange(`${s.id}.${s.desc ? 'desc' : 'asc'}`);
    },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater;
      onSelectedChange(new Set(Object.keys(next).filter((k) => next[k])));
    },
  });

  const sortableIds = new Set(['zone', 'status', 'consumption', 'change', 'cost']);

  return (
    <div className="relative overflow-x-auto" aria-busy={loading || stale || undefined}>
      {stale && (
        <div className="absolute inset-x-0 top-0 z-10 h-2 animate-pulse bg-brand" aria-hidden="true" />
      )}
      <Table
        className={cn(
          'table-fixed',
          wide ? 'min-w-[1000px]' : 'min-w-[720px]',
          stale && 'opacity-60 transition-opacity',
        )}
      >
        <caption className="sr-only">
          Zones, sorted by {SORT_LABEL[sortKey]}, {sortDir === 'desc' ? 'descending' : 'ascending'}
        </caption>
        <colgroup>
          {table.getVisibleLeafColumns().map((c) => (
            <col key={c.id} style={{ width: c.id === 'zone' ? undefined : c.getSize() }} />
          ))}
        </colgroup>
        <TableHead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => {
                const align = (h.column.columnDef.meta as { align?: 'right' } | undefined)?.align;
                const sortable = sortableIds.has(h.column.id);
                const dir = h.column.getIsSorted();
                return (
                  <TableHeaderCell
                    key={h.id}
                    align={align}
                    sort={sortable ? dir : undefined}
                    onSort={
                      sortable
                        ? () =>
                            h.column.toggleSorting(
                              dir ? dir === 'asc' : h.column.id !== 'zone' && h.column.id !== 'status',
                            )
                        : undefined
                    }
                    className={cn(
                      h.column.id === 'select' && 'sticky left-0 z-[1]',
                      h.column.id === 'zone' &&
                        'sticky left-48 z-[1] max-md:shadow-[inset_-1px_0_0_var(--color-border-subtle)]',
                    )}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHeaderCell>
                );
              })}
            </tr>
          ))}
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 10 }, (_, i) => (
                <TableSkeletonRow
                  key={i}
                  cells={[
                    <Skeleton key="a" shape="block" width={16} height={16} />,
                    <span key="b" className="flex items-center gap-8">
                      <Skeleton shape="circle" />
                      <span className="flex flex-col gap-6">
                        <Skeleton width={140} height={10} />
                        <Skeleton width={96} height={8} />
                      </span>
                    </span>,
                    <Skeleton key="c" width={72} height={16} />,
                    <Skeleton key="d" width={80} height={10} className="ml-auto" />,
                    <Skeleton key="e" width={56} height={10} className="ml-auto" />,
                    ...(wide
                      ? [
                          <Skeleton key="f" width={64} height={10} className="ml-auto" />,
                          <Skeleton key="g" width={120} height={8} />,
                        ]
                      : []),
                    <span key="h" />,
                  ]}
                />
              ))
            : table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} selected={row.getIsSelected()}>
                  {row.getVisibleCells().map((cell) => {
                    const align = (cell.column.columnDef.meta as { align?: 'right' } | undefined)?.align;
                    return (
                      <TableCell
                        key={cell.id}
                        align={align}
                        className={cn(
                          'bg-inherit',
                          cell.column.id === 'select' && 'sticky left-0 z-[1]',
                          cell.column.id === 'zone' &&
                            'sticky left-48 z-[1] max-md:shadow-[inset_-1px_0_0_var(--color-border-subtle)]',
                          cell.column.id === 'actions' && 'pr-12 text-right',
                          align === 'right' && '[&>*]:ml-auto',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
