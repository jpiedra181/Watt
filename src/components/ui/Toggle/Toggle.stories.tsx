import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { figma, StateGrid } from '@/stories/helpers';
import { Toggle } from './Toggle';

const meta = {
  title: 'Components/Forms/Toggle',
  component: Toggle,
  parameters: { ...figma('11:559') },
  args: { label: 'Daily summary email at 08:00' },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Loading: Story = { args: { defaultChecked: true, loading: true } };
export const Disabled: Story = {
  args: { disabled: true, label: 'Auto-apply low-risk recommendations', hint: '· Pro plan' },
};

export const Interaction: Story = {
  render: function Render(args) {
    const [on, setOn] = useState(false);
    return <Toggle {...args} checked={on} onCheckedChange={setOn} />;
  },
  play: async ({ canvas }) => {
    const sw = canvas.getByRole('switch', { name: 'Daily summary email at 08:00' });
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(sw).toBeChecked();
  },
};

const states = ['Default', 'Hover', 'Focus', 'Pressed', 'Disabled', 'Loading'];

export const AllStates: Story = {
  parameters: {
    pseudo: {
      hover: ["[data-demo='hover'] .group\\/tg"],
      focusVisible: ["[data-demo='focus'] button"],
      active: ["[data-demo='pressed'] .group\\/tg", "[data-demo='pressed'] button"],
    },
    layout: 'padded',
  },
  render: () => (
    <StateGrid
      cellWidth={88}
      columns={states}
      rows={[false, true].map((checked) => ({
        label: checked ? 'On' : 'Off',
        cells: states.map((s) => (
          <Toggle
            key={s}
            label="Label"
            checked={checked}
            disabled={s === 'Disabled'}
            loading={s === 'Loading'}
          />
        )),
      }))}
    />
  ),
};
