import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis, Thermometer } from 'lucide-react';
import { figma, StateGrid } from '@/stories/helpers';
import { Checkbox } from '../../ui/Checkbox/Checkbox';
import { Delta } from '../../ui/Delta/Delta';
import { IconButton } from '../../ui/IconButton/IconButton';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import { StatusBadge } from '../../ui/StatusBadge/StatusBadge';
import { ShareBar } from '../ShareBar/ShareBar';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSkeletonRow } from './Table';

const meta = {
  title: 'Components/Data display/Table',
  component: Table,
  parameters: { ...figma('14:398'), layout: 'padded' },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma `Table Header Cell` (14:472) · Sort None/Ascending/Descending × Align Left/Right × Default/Hover. */
export const HeaderCellStates: Story = {
  name: 'Table Header Cell · all states',
  parameters: { ...figma('14:472'), pseudo: { hover: ["[data-demo='hover'] button"] } },
  render: () => (
    <StateGrid
      cellWidth={160}
      columns={['Default', 'Hover']}
      rows={(['left', 'right'] as const).flatMap((align) =>
        ([false, 'asc', 'desc'] as const).map((sort) => ({
          label: `${align === 'left' ? 'Left' : 'Right'} · ${sort === false ? 'none' : sort === 'asc' ? 'ascending' : 'descending'}`,
          cells: ['Default', 'Hover'].map((s) => (
            <table key={s} className="w-[160px]">
              <thead>
                <tr>
                  <TableHeaderCell align={align} sort={sort} onSort={() => {}} className="w-[160px]">
                    Column
                  </TableHeaderCell>
                </tr>
              </thead>
            </table>
          )),
        })),
      )}
    />
  ),
};

function DemoRow({ selected, focus, hover }: { selected?: boolean; focus?: boolean; hover?: boolean }) {
  return (
    <TableRow selected={selected} className={hover ? 'demo-hover' : undefined}>
      <TableCell className="w-48">
        <Checkbox label="Select Climate (HVAC)" hideLabel checked={selected} />
      </TableCell>
      <TableCell>
        <span className="flex items-center gap-8">
          <span
            aria-hidden="true"
            className="flex size-32 items-center justify-center rounded-md bg-subtle text-icon-secondary"
          >
            <Thermometer size={16} />
          </span>
          <span className="flex flex-col">
            <a
              href="#climate"
              className="row-link type-body-small-strong text-primary outline-none"
              data-focus={focus || undefined}
            >
              Climate (HVAC)
            </a>
            <span className="type-caption text-tertiary">Heat pumps · 3 meters</span>
          </span>
        </span>
      </TableCell>
      <TableCell className="w-[132px]">
        <StatusBadge tone="warning">Attention</StatusBadge>
      </TableCell>
      <TableCell align="right" className="w-[136px] type-data-mono-strong">
        1,642 kWh
      </TableCell>
      <TableCell align="right" className="w-[128px] [&>*]:ml-auto">
        <Delta value="14.2%" direction="up" sentiment="negative" />
      </TableCell>
      <TableCell align="right" className="w-[112px] type-data-mono text-secondary">
        € 352.10
      </TableCell>
      <TableCell className="w-[168px]">
        <span className="flex items-center gap-8">
          <ShareBar share={0.34} color="var(--color-chart-series-1)" />
          <span className="type-data-mono text-secondary">34%</span>
        </span>
      </TableCell>
      <TableCell className="w-56">
        <IconButton variant="ghost" icon={Ellipsis} label="Actions for Climate (HVAC)" tooltip={false} />
      </TableCell>
    </TableRow>
  );
}

/** Figma `Table Row` (14:652) · Default, Hover, Selected, Focus, Loading. */
export const RowStates: Story = {
  name: 'Table Row · all states',
  parameters: {
    ...figma('14:652'),
    pseudo: { hover: ['tr.demo-hover'], focusVisible: ['a[data-focus]'] },
  },
  render: () => (
    <div className="w-[1136px] overflow-hidden rounded-lg border border-default">
      <Table className="table-fixed">
        <caption className="sr-only">Zone row states</caption>
        <TableHead>
          <tr>
            <TableHeaderCell className="w-48">
              <span className="sr-only">Select</span>
            </TableHeaderCell>
            <TableHeaderCell sort={false} onSort={() => {}}>
              Zone
            </TableHeaderCell>
            <TableHeaderCell className="w-[132px]">Status</TableHeaderCell>
            <TableHeaderCell align="right" sort="desc" onSort={() => {}} className="w-[136px]">
              Consumption
            </TableHeaderCell>
            <TableHeaderCell align="right" className="w-[128px]">
              vs August
            </TableHeaderCell>
            <TableHeaderCell align="right" className="w-[112px]">
              Cost
            </TableHeaderCell>
            <TableHeaderCell className="w-[168px]">Share</TableHeaderCell>
            <TableHeaderCell className="w-56">
              <span className="sr-only">Actions</span>
            </TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          <DemoRow />
          <DemoRow hover />
          <DemoRow selected />
          <DemoRow focus />
          <TableSkeletonRow
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
              <Skeleton key="f" width={64} height={10} className="ml-auto" />,
              <Skeleton key="g" width={120} height={8} />,
              <span key="h" />,
            ]}
          />
        </TableBody>
      </Table>
    </div>
  ),
};
