import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ellipsis, Moon, PanelLeft } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { figma, pseudoStates, StateGrid } from '@/stories/helpers';
import { IconButton } from './IconButton';

const meta = {
  title: 'Components/Actions/Icon Button',
  component: IconButton,
  parameters: { ...figma('9:303') },
  args: { icon: Ellipsis, label: 'More actions', variant: 'secondary', onClick: fn() },
  argTypes: { icon: { control: false } },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {};
export const Ghost: Story = { args: { variant: 'ghost', icon: Moon, label: 'Switch to dark theme' } };
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };

/** The tooltip carries the same text as the accessible name and opens on keyboard focus too. */
export const TooltipOnFocus: Story = {
  args: { variant: 'ghost', icon: PanelLeft, label: 'Collapse sidebar' },
  play: async ({ canvas, canvasElement }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Collapse sidebar' })).toHaveFocus();
    // Radix renders the tooltip in a portal on <body>.
    await expect(await within(canvasElement.ownerDocument.body).findByRole('tooltip')).toHaveTextContent(
      'Collapse sidebar',
    );
  },
};

const states = ['Default', 'Hover', 'Focus', 'Pressed', 'Disabled', 'Loading'];

export const AllStates: Story = {
  parameters: { ...pseudoStates('button'), layout: 'padded' },
  render: () => (
    <StateGrid
      cellWidth={48}
      columns={states}
      rows={(['secondary', 'ghost'] as const).map((variant) => ({
        label: variant === 'ghost' ? 'Ghost' : 'Secondary',
        cells: states.map((s) => (
          <IconButton
            key={s}
            variant={variant}
            icon={Ellipsis}
            label="More actions"
            tooltip={false}
            disabled={s === 'Disabled'}
            loading={s === 'Loading'}
          />
        )),
      }))}
    />
  ),
};
