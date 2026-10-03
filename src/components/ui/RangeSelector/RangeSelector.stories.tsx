import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { figma } from '@/stories/helpers';
import { RangeSelector } from './RangeSelector';

const ranges = [
  { value: '24h', label: '24h', description: 'Last 24 hours' },
  { value: '7d', label: '7d', description: 'Last 7 days' },
  { value: '30d', label: '30d', description: 'Last 30 days' },
  { value: '12m', label: '12m', description: 'Last 12 months' },
] as const;
type Range = (typeof ranges)[number]['value'];

const meta = {
  title: 'Components/Navigation/Range Selector',
  component: RangeSelector,
  parameters: { ...figma('13:299') },
} satisfies Meta<typeof RangeSelector>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default selection is 30d. Arrow keys move between options, Space/Enter selects. */
export const Default: Story = {
  args: { label: 'Chart range', options: ranges, value: '30d', onValueChange: () => {} },
  render: function Render() {
    const [value, setValue] = useState<Range>('30d');
    return <RangeSelector label="Chart range" options={ranges} value={value} onValueChange={setValue} />;
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('radio', { name: 'Last 7 days' }));
    await expect(canvas.getByRole('radio', { name: 'Last 7 days' })).toHaveAttribute('aria-checked', 'true');
  },
};
