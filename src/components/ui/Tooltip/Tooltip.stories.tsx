import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Info } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { figma } from '@/stories/helpers';
import { Tooltip } from './Tooltip';

const meta = {
  title: 'Components/Overlays/Tooltip',
  component: Tooltip,
  parameters: { ...figma('13:367') },
  args: { content: 'Tooltip', children: null },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// Radix Slot passes ref + handlers to the trigger, so the trigger must spread its props.
const InfoButton = (props: ComponentProps<'button'>) => (
  <button
    {...props}
    type="button"
    aria-label="About total consumption"
    className="flex size-24 items-center justify-center rounded-sm text-icon-secondary outline-none focus-visible:shadow-focus-ring"
  >
    <Info size={16} aria-hidden="true" />
  </button>
);

/** Hover or focus the info button. Esc closes it; the bubble stays open while hovered. */
export const Default: Story = {
  render: () => (
    <Tooltip content="All meters, including common areas, for the selected period.">
      <InfoButton />
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.tab();
    // Radix renders the tooltip in a portal on <body>.
    await expect(await within(canvasElement.ownerDocument.body).findByRole('tooltip')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

/** Figma `Placement` = Top, Bottom, Left, Right. */
export const Placements: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-4 gap-x-96 px-80 py-64">
      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
        <Tooltip key={side} content="Tooltip" side={side} open>
          <InfoButton />
        </Tooltip>
      ))}
    </div>
  ),
};
