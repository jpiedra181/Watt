import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronDown, Download, Plus } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { figma, pseudoStates, StateGrid } from '@/stories/helpers';
import { Button } from './Button';

const meta = {
  title: 'Components/Actions/Button',
  component: Button,
  parameters: { ...figma('9:216') },
  args: { children: 'Button', variant: 'primary', onClick: fn() },
  argTypes: {
    leadingIcon: { control: false },
    trailingIcon: { control: false },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Primary: Story = { args: { variant: 'primary', children: 'Add zone', leadingIcon: Plus } };
export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Export report', leadingIcon: Download },
};
export const Ghost: Story = { args: { variant: 'ghost', children: 'Dismiss' } };
export const Destructive: Story = { args: { variant: 'destructive', children: 'Delete zone' } };
export const WithTrailingIcon: Story = {
  args: { variant: 'secondary', children: 'September 2026', trailingIcon: ChevronDown },
};

export const Loading: Story = {
  args: { loading: true, children: 'Resolve 3 alerts' },
  play: async ({ canvas, args }) => {
    const button = canvas.getByRole('button', { name: 'Resolve 3 alerts' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Disabled: Story = { args: { disabled: true } };

const variants = ['primary', 'secondary', 'ghost', 'destructive'] as const;
const states = ['Default', 'Hover', 'Focus', 'Pressed', 'Disabled', 'Loading'];

/** Every Variant × State from the Figma component set. Hover, Focus and Pressed are forced CSS states. */
export const AllStates: Story = {
  parameters: { ...pseudoStates('button'), layout: 'padded' },
  render: () => (
    <StateGrid
      columns={states}
      rows={variants.map((variant) => ({
        label: variant[0]!.toUpperCase() + variant.slice(1),
        cells: states.map((s) => (
          <Button key={s} variant={variant} disabled={s === 'Disabled'} loading={s === 'Loading'}>
            Button
          </Button>
        )),
      }))}
    />
  ),
};

export const KeyboardActivation: Story = {
  args: { children: 'Save changes' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.tab();
    await expect(canvas.getByRole('button')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};
