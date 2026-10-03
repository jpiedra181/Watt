import type { Meta, StoryObj } from '@storybook/react-vite';
import { figma, StateGrid, withFrame } from '@/stories/helpers';
import { ShareBar } from '../ShareBar/ShareBar';
import { Sparkline } from '../Sparkline/Sparkline';
import { ZoneShareRow } from './ZoneShareRow';

const meta = {
  title: 'Components/Data display/Zone Share Row',
  component: ZoneShareRow,
  parameters: { ...figma('20:1456') },
  args: { zone: 'Climate (HVAC)', value: '1,642 kWh', share: '34%', color: 'var(--color-chart-series-1)' },
  decorators: [withFrame('w-[360px] rounded-lg border border-default bg-surface p-8')],
} satisfies Meta<typeof ZoneShareRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** As a link to the zone page (Overview › By zone). */
export const AsLink: Story = { args: { to: '/zones/climate' } };

export const AllStates: Story = {
  parameters: { layout: 'padded', fullWidth: true, pseudo: { hover: ["[data-demo='hover'] a"] } },
  render: (args) => (
    <StateGrid
      cellWidth={360}
      columns={['Default', 'Hover']}
      rows={[
        {
          cells: ['Default', 'Hover'].map((s) => (
            <ZoneShareRow key={s} {...args} to="/zones/climate" className="w-[360px]" />
          )),
        },
      ]}
    />
  ),
};

/** Small helpers used inside the table and the KPI card. */
export const ShareBarAndSparkline: Story = {
  render: () => (
    <div className="flex items-center gap-24">
      <ShareBar share={0.21} color="var(--color-chart-series-1)" />
      <ShareBar share={0.08} color="var(--color-chart-series-3)" />
      <Sparkline values={[148, 152, 150, 156, 154, 158, 155, 160, 158, 163, 161, 166]} />
    </div>
  ),
};
