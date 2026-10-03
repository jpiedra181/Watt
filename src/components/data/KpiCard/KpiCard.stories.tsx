import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bed, Euro, Gauge, Zap } from 'lucide-react';
import { expect, fn, userEvent } from 'storybook/test';
import { figma, StateGrid, withWidth } from '@/stories/helpers';
import { KpiCard } from './KpiCard';

const trend = [148, 152, 150, 156, 154, 158, 155, 160, 158, 163, 161, 166];

const meta = {
  title: 'Components/Data display/KPI Card',
  component: KpiCard,
  parameters: { ...figma('14:391') },
  args: {
    label: 'Total consumption',
    icon: Zap,
    info: 'Energy measured by all 24 meters, including common areas, in the selected month.',
    value: '4,812',
    unit: 'kWh',
    delta: { value: '6.1%', direction: 'down', sentiment: 'positive' },
    comparison: 'vs August',
    trend,
    onRetry: fn(),
  },
  argTypes: { icon: { control: false } },
  decorators: [withWidth(280)],
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** With `to`, the label becomes a link stretched over the card — Figma Hover/Focus states. */
export const Interactive: Story = { args: { to: '/zones' } };

export const Loading: Story = { args: { status: 'loading' } };
export const Empty: Story = { args: { status: 'empty' } };

/** The error says what failed and offers Retry; the alert role announces it. */
export const Error: Story = {
  args: { status: 'error', errorDetail: 'Meter offline since 14:20' },
  play: async ({ canvas, args }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Couldn’t load data');
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(args.onRetry).toHaveBeenCalled();
  },
};

export const NegativeChange: Story = {
  args: {
    label: 'Peak demand',
    icon: Gauge,
    value: '52.4',
    unit: 'kW',
    delta: { value: '9.8%', direction: 'up', sentiment: 'negative' },
  },
};

const states = ['Default', 'Hover', 'Focus', 'Loading', 'Empty', 'Error'] as const;

/** Figma `State` row: Default · Hover · Focus · Loading · Empty · Error. */
export const AllStates: Story = {
  parameters: {
    layout: 'padded',
    fullWidth: true,
    pseudo: { hover: ["[data-demo='hover'] article"], focusVisible: ["[data-demo='focus'] a"] },
  },
  render: (args) => (
    <StateGrid
      cellWidth={260}
      columns={[...states]}
      rows={[
        {
          cells: states.map((s) => (
            <KpiCard
              key={s}
              {...args}
              className="w-[260px]"
              to={s === 'Hover' || s === 'Focus' ? '/zones' : undefined}
              status={
                s === 'Loading' ? 'loading' : s === 'Empty' ? 'empty' : s === 'Error' ? 'error' : 'ready'
              }
              errorDetail="Meter offline since 14:20"
            />
          )),
        },
      ]}
    />
  ),
};

/** The four Overview cards. */
export const OverviewRow: Story = {
  parameters: { layout: 'padded', fullWidth: true },
  render: () => (
    <div className="grid w-[1136px] grid-cols-4 gap-16">
      <KpiCard
        label="Total consumption"
        icon={Zap}
        value="4,812"
        unit="kWh"
        delta={{ value: '6.1%', direction: 'down', sentiment: 'positive' }}
        comparison="vs August"
        trend={trend}
        info="All meters."
      />
      <KpiCard
        label="Energy cost"
        icon={Euro}
        value="1,032.17"
        unit="€"
        delta={{ value: '4.3%', direction: 'down', sentiment: 'positive' }}
        comparison="vs August"
        trend={trend}
        info="Energy term."
      />
      <KpiCard
        label="Peak demand"
        icon={Gauge}
        value="52.4"
        unit="kW"
        delta={{ value: '9.8%', direction: 'up', sentiment: 'negative' }}
        comparison="vs August"
        trend={trend}
        info="Highest hour."
      />
      <KpiCard
        label="Per guest night"
        icon={Bed}
        value="9.4"
        unit="kWh"
        delta={{ value: '3.2%', direction: 'up', sentiment: 'negative' }}
        comparison="vs August"
        trend={trend.slice().reverse()}
        info="Per guest night."
      />
    </div>
  ),
};
