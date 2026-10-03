import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { figma, StateGrid, withWidth } from '@/stories/helpers';
import { RecommendationCard } from './RecommendationCard';

const meta = {
  title: 'Components/Data display/Recommendation Card',
  component: RecommendationCard,
  parameters: { ...figma('20:1429') },
  args: {
    title: 'Lower the pool heat-pump setpoint 1 °C overnight',
    description:
      'From 23:00 to 07:00 the pump fights heat loss with the cover off. Water stays at 27 °C by opening time.',
    savings: '−186 kWh / mo',
    estimate: '≈ € 41 / month',
    appliedNote: 'Applied 28 Sep · tracking savings',
    onApply: fn(),
    onDismiss: fn(),
    onUndo: fn(),
  },
  decorators: [withWidth(360)],
} satisfies Meta<typeof RecommendationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Applied: Story = { args: { status: 'applied' } };
export const Applying: Story = { args: { pending: 'apply' } };

export const AllStates: Story = {
  parameters: { layout: 'padded', fullWidth: true, pseudo: { hover: ["[data-demo='hover'] article"] } },
  render: (args) => (
    <StateGrid
      cellWidth={340}
      columns={['Default', 'Hover', 'Applied']}
      rows={[
        {
          cells: ['Default', 'Hover', 'Applied'].map((s) => (
            <RecommendationCard
              key={s}
              {...args}
              className="w-[340px]"
              status={s === 'Applied' ? 'applied' : 'open'}
            />
          )),
        },
      ]}
    />
  ),
};
