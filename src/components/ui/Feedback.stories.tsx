import type { Meta, StoryObj } from '@storybook/react-vite';
import { figma, StateGrid } from '@/stories/helpers';
import { Avatar } from './Avatar/Avatar';
import { LegendItem } from './LegendItem/LegendItem';
import { Logo } from './Logo/Logo';
import { Skeleton } from './Skeleton/Skeleton';
import { Spinner } from './Spinner/Spinner';

/** Small building blocks that only have a handful of variants each. */
const meta = {
  title: 'Components/Feedback/Spinner & Skeleton',
  component: Spinner,
  parameters: { ...figma('7:23') },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma `Spinner` — Tone Default / On brand. Rotates 360° every 800ms (stops with reduced motion). */
export const Spinners: Story = {
  render: () => (
    <div className="flex items-center gap-24">
      <Spinner label="Loading" />
      <span className="flex size-36 items-center justify-center rounded-md bg-brand">
        <Spinner tone="on-brand" label="Loading" />
      </span>
      <Spinner size={12} label="Loading" />
    </div>
  ),
};

/** Figma `Skeleton` (7:169) — Line, Block, Circle. Decorative: the loading region carries aria-busy. */
export const Skeletons: Story = {
  parameters: { ...figma('7:169') },
  render: () => (
    <div className="flex items-center gap-24" aria-busy="true" aria-label="Loading">
      <Skeleton shape="line" />
      <Skeleton shape="block" />
      <Skeleton shape="circle" />
    </div>
  ),
};

export const LegendItems: Story = {
  name: 'Legend Item',
  parameters: { ...figma('7:190'), layout: 'padded' },
  render: () => (
    <StateGrid
      cellWidth={80}
      columns={['Square', 'Line', 'Dashed']}
      rows={[
        {
          cells: [
            <LegendItem key="s" shape="square" color="var(--color-chart-series-1)">
              Series
            </LegendItem>,
            <LegendItem key="l" shape="line" color="var(--color-chart-reference)">
              Series
            </LegendItem>,
            <LegendItem key="d" shape="dashed" color="var(--color-chart-reference)">
              Series
            </LegendItem>,
          ],
        },
      ]}
    />
  ),
};

export const Logos: Story = {
  name: 'Logo',
  parameters: { ...figma('7:42') },
  render: () => (
    <div className="flex items-center gap-24">
      <Logo />
      <Logo variant="mark" />
    </div>
  ),
};

export const Avatars: Story = {
  name: 'Avatar',
  parameters: { ...figma('7:56') },
  render: () => (
    <div className="flex items-center gap-24">
      <Avatar initials="LM" size="sm" name="Lucía Martín" />
      <Avatar initials="LM" size="md" name="Lucía Martín" />
    </div>
  ),
};
