import type { Meta, StoryObj } from '@storybook/react-vite';
import { figma, StateGrid } from '@/stories/helpers';
import { Delta } from './Delta';

const meta = {
  title: 'Components/Data display/Delta',
  component: Delta,
  parameters: { ...figma('7:151') },
  args: { value: '12.4%', direction: 'up', sentiment: 'negative' },
} satisfies Meta<typeof Delta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Consumption up is Negative; consumption down (or savings up) is Positive. */
export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <StateGrid
      cellWidth={72}
      columns={['Positive', 'Negative', 'Neutral']}
      rows={(['up', 'down'] as const).map((direction) => ({
        label: direction === 'up' ? 'Up' : 'Down',
        cells: (['positive', 'negative', 'neutral'] as const).map((sentiment) => (
          <Delta key={sentiment} value="12.4%" direction={direction} sentiment={sentiment} />
        )),
      }))}
    />
  ),
};
