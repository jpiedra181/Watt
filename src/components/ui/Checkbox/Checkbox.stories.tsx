import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { figma, StateGrid } from '@/stories/helpers';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Forms/Checkbox',
  component: Checkbox,
  parameters: { ...figma('11:478') },
  args: { label: 'Notify the maintenance team' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { checked: 'indeterminate', label: 'Select all zones' } };
export const Disabled: Story = { args: { disabled: true, defaultChecked: true } };
export const Error: Story = { args: { invalid: true, label: 'I accept the new tariff' } };

/** Space toggles; clicking the label toggles too. */
export const Interaction: Story = {
  render: function Render(args) {
    const [checked, setChecked] = useState(false);
    return <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />;
  },
  play: async ({ canvas }) => {
    const box = canvas.getByRole('checkbox', { name: 'Notify the maintenance team' });
    await userEvent.tab();
    await userEvent.keyboard(' ');
    await expect(box).toBeChecked();
    await userEvent.click(canvas.getByText('Notify the maintenance team'));
    await expect(box).not.toBeChecked();
  },
};

const states = ['Default', 'Hover', 'Focus', 'Pressed', 'Disabled', 'Error'];
const checks = [
  { label: 'Off', checked: false },
  { label: 'On', checked: true },
  { label: 'Indeterminate', checked: 'indeterminate' as const },
];

export const AllStates: Story = {
  parameters: {
    pseudo: {
      hover: ["[data-demo='hover'] .group\\/cb"],
      focusVisible: ["[data-demo='focus'] button"],
      active: ["[data-demo='pressed'] button"],
    },
    layout: 'padded',
  },
  render: () => (
    <StateGrid
      cellWidth={88}
      columns={states}
      rows={checks.map((c) => ({
        label: c.label,
        cells: states.map((s) => (
          <Checkbox
            key={s}
            label="Label"
            checked={c.checked}
            disabled={s === 'Disabled'}
            invalid={s === 'Error'}
          />
        )),
      }))}
    />
  ),
};
