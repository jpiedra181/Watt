import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { history, hourly, overview } from '@/mocks/db';
import { figma } from '@/stories/helpers';
import { zoneTypeColor } from '@/lib/zones';
import { ChartTooltip } from './ChartTooltip/ChartTooltip';
import { HistoryChart } from './HistoryChart/HistoryChart';
import { HourlyConsumptionChart } from './HourlyConsumptionChart/HourlyConsumptionChart';
import { ZoneBreakdown } from './ZoneBreakdown/ZoneBreakdown';
import { chartColor } from './chartTheme';

const today = hourly('2026-09-30')!;
const climate30d = history('climate', '30d', '2026-09');
const byType = overview('2026-09').byType;

/**
 * Charts are drawn with Recharts and coloured only through chart tokens, so they follow light/dark.
 * Each one is a single image for assistive tech (a written summary), plus a "Show data table"
 * button that appears on keyboard focus and reveals every value.
 */
const meta = {
  title: 'Components/Charts/Hourly Consumption',
  component: HourlyConsumptionChart,
  parameters: { ...figma('21:1397'), layout: 'padded' },
  args: {
    data: today.points,
    contractedKw: 45,
    typicalLabel: 'Typical Tuesday',
    dayLabel: 'Tue 30 Sep',
  },
  argTypes: { data: { control: false } },
  decorators: [
    (Story) => <div className="w-[720px] rounded-lg border border-default bg-surface p-20">{Story()}</div>,
  ],
} satisfies Meta<typeof HourlyConsumptionChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { status: 'loading' } };
export const Empty: Story = { args: { status: 'empty' } };
export const Error: Story = { args: { status: 'error', onRetry: () => {} } };

/** Keyboard users reach the data table through the first Tab stop inside the chart. */
export const DataTable: Story = {
  play: async ({ canvas }) => {
    await userEvent.tab();
    const toggle = canvas.getByRole('button', { name: 'Show data table' });
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByRole('table', { name: 'Hourly consumption, Tue 30 Sep' })).toBeVisible();
    await expect(canvas.getAllByRole('row')).toHaveLength(25);
  },
};

/** The same chart on a 324px phone card (Figma mobile). */
export const Narrow: Story = {
  decorators: [(Story) => <div className="w-[358px]">{Story()}</div>],
};

export const Tooltip: StoryObj<typeof ChartTooltip> = {
  name: 'Chart Tooltip',
  parameters: { ...figma('13:376') },
  render: () => (
    <div className="flex gap-24">
      <ChartTooltip
        title="Tue 30 Sep · 19:00–20:00"
        rows={[
          { label: 'Today', value: '52.4 kWh', color: chartColor.barAlert },
          { label: 'Typical Tuesday', value: '38.1 kWh', color: chartColor.reference, swatch: 'line' },
        ]}
        note={{ tone: 'critical', text: 'Over contract · +7.4 kW' }}
      />
      <ChartTooltip
        title="Tue 30 Sep · 18:00–19:00"
        rows={[
          { label: 'Today', value: '39.0 kWh', color: chartColor.barPeak },
          { label: 'Typical Tuesday', value: '34.0 kWh', color: chartColor.reference, swatch: 'line' },
        ]}
        note={{ tone: 'warning', text: 'Peak · 15% above typical' }}
      />
      <ChartTooltip
        title="Sun 14 Sep"
        rows={[
          { label: 'Climate (HVAC)', value: '74 kWh', color: zoneTypeColor.climate, swatch: 'line' },
          { label: 'August', value: '72 kWh', color: chartColor.cursor, swatch: 'dashed' },
        ]}
      />
    </div>
  ),
};

export const History: StoryObj<typeof HistoryChart> = {
  name: 'History · Default',
  parameters: { ...figma('21:1526') },
  render: (args) => (
    <HistoryChart
      {...args}
      data={climate30d.points}
      ticks={climate30d.ticks}
      seriesLabel={climate30d.seriesLabel}
      previousLabel={climate30d.previousLabel}
      color={zoneTypeColor.climate}
    />
  ),
};

export const HistoryLoading: StoryObj<typeof HistoryChart> = {
  name: 'History · Loading',
  render: () => (
    <HistoryChart
      status="loading"
      data={[]}
      seriesLabel="Climate (HVAC) · September"
      previousLabel="August"
      color={zoneTypeColor.climate}
    />
  ),
};

export const HistoryEmpty: StoryObj<typeof HistoryChart> = {
  name: 'History · Empty',
  render: () => (
    <HistoryChart
      status="empty"
      data={climate30d.points.map((p) => ({ ...p, value: null, previous: null }))}
      ticks={climate30d.ticks}
      seriesLabel="Climate (HVAC) · September"
      previousLabel="August"
      color={zoneTypeColor.climate}
      emptyDescription="This meter was installed on 28 Sep. Try 7d."
    />
  ),
};

export const HistoryOtherZone: StoryObj<typeof HistoryChart> = {
  name: 'History · Pool, 7 days',
  render: () => {
    const h = history('pool', '7d', '2026-09');
    return (
      <HistoryChart
        data={h.points}
        ticks={h.ticks}
        seriesLabel={h.seriesLabel}
        previousLabel={h.previousLabel}
        color={zoneTypeColor.pool}
      />
    );
  },
};

export const Breakdown: StoryObj<typeof ZoneBreakdown> = {
  name: 'Zone Breakdown',
  parameters: { ...figma('21:1398') },
  decorators: [(Story) => <div className="w-[360px]">{Story()}</div>],
  render: () => (
    <ZoneBreakdown
      items={byType.map((t) => ({
        id: t.type,
        name: t.name,
        kwh: t.kwh,
        share: t.share,
        color: zoneTypeColor[t.type],
        to: `/zones/${t.type}`,
      }))}
    />
  ),
};

export const BreakdownLoading: StoryObj<typeof ZoneBreakdown> = {
  name: 'Zone Breakdown · Loading',
  decorators: [(Story) => <div className="w-[360px]">{Story()}</div>],
  render: () => <ZoneBreakdown loading items={[]} />,
};
