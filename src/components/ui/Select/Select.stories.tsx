import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bed, Layers, Sofa, Thermometer, Utensils, Waves } from 'lucide-react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { figma, StateGrid, withWidth } from '@/stories/helpers';
import { Select, type SelectOption } from './Select';

const zones: SelectOption[] = [
  { value: 'all', label: 'All zones', icon: Layers },
  { value: 'climate', label: 'Climate (HVAC)', icon: Thermometer },
  { value: 'pool', label: 'Pool', icon: Waves },
  { value: 'rooms', label: 'Rooms', icon: Bed },
  { value: 'kitchen', label: 'Kitchen', icon: Utensils },
  { value: 'common', label: 'Common areas', icon: Sofa, disabled: true },
];

const meta = {
  title: 'Components/Forms/Select',
  component: Select,
  parameters: { ...figma('11:377') },
  args: { label: 'Label', helper: 'Helper text', options: zones, onValueChange: fn() },
  decorators: [withWidth(240)],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = { args: { defaultValue: 'pool' } };

/** Figma `State=Open` — the Dropdown Menu attaches 4px below the field. */
export const Open: Story = {
  args: { open: true, defaultValue: 'all' },
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="h-[320px] w-[240px]">{Story()}</div>],
};

export const Error: Story = { args: { error: 'Choose the meter that feeds this zone.' } };
export const Disabled: Story = { args: { defaultValue: 'pool', disabled: true } };
export const Loading: Story = { args: { loading: true } };

export const Compact: Story = {
  name: 'Size sm (rows per page)',
  args: {
    size: 'sm',
    label: 'Rows per page',
    hideLabel: true,
    helper: undefined,
    defaultValue: '10',
    options: [10, 25, 50].map((n) => ({ value: String(n), label: String(n) })),
  },
  decorators: [(Story) => <div className="w-60">{Story()}</div>],
};

/** ↓ opens the list, arrows move, Enter chooses — focus returns to the trigger. */
export const KeyboardSelection: Story = {
  args: { label: 'Zone type' },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Zone type' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await expect(args.onValueChange).toHaveBeenCalled();
    await expect(trigger).toHaveFocus();
  },
};

const states = ['Default', 'Hover', 'Focus', 'Filled', 'Disabled', 'Error', 'Loading'];

export const AllStates: Story = {
  parameters: {
    pseudo: { hover: ["[data-demo='hover'] button"], focusVisible: ["[data-demo='focus'] button"] },
    layout: 'padded',
    fullWidth: true,
  },
  render: (args) => (
    <StateGrid
      cellWidth={180}
      columns={states}
      rows={[
        {
          cells: states.map((s) => (
            <Select
              key={s}
              {...args}
              className="w-[180px]"
              defaultValue={['Filled', 'Disabled', 'Error'].includes(s) ? 'pool' : undefined}
              disabled={s === 'Disabled'}
              error={s === 'Error' ? 'Error message' : undefined}
              loading={s === 'Loading'}
            />
          )),
        },
      ]}
    />
  ),
};
