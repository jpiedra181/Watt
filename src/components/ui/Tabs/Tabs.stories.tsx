import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { figma, StateGrid } from '@/stories/helpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

const meta = {
  title: 'Components/Navigation/Tabs',
  component: Tabs,
  parameters: { ...figma('13:286') },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Underline style with counts — the Alerts page filter. ←/→ move between tabs, the panel follows. */
export const Underline: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-[520px]">
      <TabsList aria-label="Alert status" className="border-b border-default">
        <TabsTrigger value="all" count={24}>
          All
        </TabsTrigger>
        <TabsTrigger value="new" count={3}>
          New
        </TabsTrigger>
        <TabsTrigger value="reviewed" count={5}>
          Reviewed
        </TabsTrigger>
        <TabsTrigger value="resolved" count={16}>
          Resolved
        </TabsTrigger>
      </TabsList>
      {['all', 'new', 'reviewed', 'resolved'].map((v) => (
        <TabsContent key={v} value={v} className="py-16 type-body-small text-secondary">
          Showing {v} alerts.
        </TabsContent>
      ))}
    </Tabs>
  ),
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('tab', { name: /All/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: /New/ })).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent('Showing new alerts.');
  },
};

export const Segmented: Story = {
  render: () => (
    <Tabs defaultValue="month">
      <TabsList variant="segmented" aria-label="Report">
        <TabsTrigger value="day">Day</TabsTrigger>
        <TabsTrigger value="week">Week</TabsTrigger>
        <TabsTrigger value="month">Month</TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="a">
      <TabsList aria-label="Example">
        <TabsTrigger value="a">Overview</TabsTrigger>
        <TabsTrigger value="b" disabled>
          Forecast
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
};

const states = ['Default', 'Hover', 'Focus', 'Disabled'];

/** Style × Selected × State from the Figma component set. */
export const AllStates: Story = {
  parameters: {
    pseudo: { hover: ["[data-demo='hover'] button"], focusVisible: ["[data-demo='focus'] button"] },
    layout: 'padded',
  },
  render: () => (
    <StateGrid
      cellWidth={72}
      columns={states}
      rows={(['underline', 'segmented'] as const).flatMap((variant) =>
        [false, true].map((selected) => ({
          label: `${variant === 'underline' ? 'Underline' : 'Segmented'} · ${selected ? 'selected' : 'idle'}`,
          cells: states.map((s) => (
            <Tabs key={s} value={selected ? 'tab' : 'other'}>
              <TabsList
                variant={variant}
                aria-label="Demo"
                className={variant === 'segmented' ? 'bg-transparent p-0' : ''}
              >
                <TabsTrigger value="tab" disabled={s === 'Disabled'}>
                  Tab
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )),
        })),
      )}
    />
  ),
};
