import type { Meta, StoryObj } from '@storybook/react-vite';
import { Search } from 'lucide-react';
import { expect, userEvent } from 'storybook/test';
import { figma, StateGrid, withWidth } from '@/stories/helpers';
import { Input } from './Input';

const meta = {
  title: 'Components/Forms/Input',
  component: Input,
  parameters: { ...figma('9:399') },
  args: { label: 'Label', placeholder: 'Placeholder', helper: 'Helper text' },
  argTypes: { leadingIcon: { control: false } },
  decorators: [withWidth(260)],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = {
  args: { defaultValue: 'Casa Rural El Olivar', label: 'Property name', helper: undefined },
};
export const WithLeadingIcon: Story = {
  args: {
    label: 'Search zones',
    hideLabel: true,
    leadingIcon: Search,
    placeholder: 'Search zones…',
    helper: undefined,
  },
};
export const Loading: Story = { args: { defaultValue: 'Value', loading: true } };
export const Disabled: Story = { args: { defaultValue: 'Value', disabled: true } };

/** The message replaces the helper, is linked with aria-describedby and the field gets aria-invalid. */
export const Error: Story = {
  args: {
    label: 'Contracted power (kW)',
    defaultValue: '4,5',
    error: 'Enter a value between 10 and 100 kW — use a dot for decimals.',
    helper: undefined,
  },
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Contracted power (kW)');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Enter a value between 10 and 100 kW — use a dot for decimals.',
    );
  },
};

export const TypesAndFocuses: Story = {
  args: {
    label: 'Billing day',
    placeholder: 'Day of the month (1–28)',
    helper: 'We split monthly reports on this day.',
  },
  play: async ({ canvas }) => {
    await userEvent.tab();
    const input = canvas.getByLabelText('Billing day');
    await expect(input).toHaveFocus();
    await userEvent.type(input, '14');
    await expect(input).toHaveValue('14');
  },
};

const states = ['Default', 'Hover', 'Focus', 'Filled', 'Disabled', 'Error', 'Loading'];

export const AllStates: Story = {
  parameters: {
    pseudo: {
      hover: ["[data-demo='hover'] div:has(> input)"],
      focusVisible: ["[data-demo='focus'] input"],
    },
    layout: 'padded',
    fullWidth: true,
  },
  render: () => (
    <StateGrid
      cellWidth={200}
      columns={states}
      rows={[
        {
          cells: states.map((s) => (
            <Input
              key={s}
              className="w-[200px]"
              label="Label"
              placeholder="Placeholder"
              helper="Helper text"
              defaultValue={['Filled', 'Disabled', 'Error', 'Loading'].includes(s) ? 'Value' : undefined}
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
