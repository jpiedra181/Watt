import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent } from 'storybook/test';
import { figma, StateGrid, withFrame } from '@/stories/helpers';
import { AlertItem } from './AlertItem';

const meta = {
  title: 'Components/Data display/Alert Item',
  component: AlertItem,
  parameters: { ...figma('20:1302'), layout: 'padded' },
  args: {
    severity: 'critical',
    status: 'new',
    title: 'Peak over contracted power',
    meta: 'Pool · Heat pump P-01 · 52.4 kW for 18 min (limit 45 kW)',
    time: 'Today, 19:42',
    onAction: fn(),
  },
  decorators: [withFrame('max-w-[900px] overflow-hidden rounded-lg border border-default')],
} satisfies Meta<typeof AlertItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const New: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: /Mark reviewed/ }));
    await expect(args.onAction).toHaveBeenCalled();
  },
};
export const Reviewed: Story = {
  args: {
    status: 'reviewed',
    severity: 'warning',
    title: 'Pool cover left open overnight',
    meta: 'Pool · water lost 2.1 °C · 38 kWh extra to reheat',
  },
};
export const Resolved: Story = {
  args: {
    status: 'resolved',
    severity: 'warning',
    title: 'Dryer running at peak tariff',
    meta: 'Laundry · 12 kWh between 18:00 and 20:00',
  },
};
export const ActionPending: Story = { args: { actionPending: true } };
/** Overview list: no row actions (Figma `Show actions=false`). */
export const WithoutActions: Story = { args: { showActions: false } };

/** Status × Severity × State, as on the Figma Components page. */
export const AllStates: Story = {
  // Cells must be the AlertItem itself (no wrapper element), so the hover marker is a class.
  parameters: { fullWidth: true, layout: 'padded', pseudo: { hover: ['.demo-hover'] } },
  render: (args) => (
    <StateGrid
      columns={['Alert item']}
      rows={(['new', 'reviewed', 'resolved'] as const).flatMap((status) =>
        (['critical', 'warning'] as const).flatMap((severity) =>
          (['Default', 'Hover'] as const).map((state) => ({
            label: `${cap(status)} · ${cap(severity)} · ${state}`,
            cells: [
              <AlertItem
                key={state}
                {...args}
                status={status}
                severity={severity}
                className={`w-[880px] rounded-md border border-subtle ${state === 'Hover' ? 'demo-hover' : ''}`}
              />,
            ],
          })),
        ),
      )}
    />
  ),
};

const cap = (s: string) => s[0]?.toUpperCase() + s.slice(1);
