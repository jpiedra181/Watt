import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AppAt, scenario } from '@/stories/decorators';

/**
 * The five Figma screens running against the mock API. Each story sets a scenario for the fake
 * gateway — fast, never answering (loading), failing (error) or empty — so every state can be
 * reviewed on the real screens, not only on isolated components.
 */
const meta = {
  title: 'Screens',
  component: AppAt,
  parameters: { screen: true, layout: 'fullscreen', a11y: { test: 'error' } },
  args: { url: '/overview' },
  beforeEach: scenario({}),
} satisfies Meta<typeof AppAt>;

export default meta;
type Story = StoryObj<typeof meta>;

const FIGMA = 'https://www.figma.com/design/xRB9FSPYbdup5v6rJz4R9F/Dashboard---Watt?node-id=';
const design = (id: string) => ({ design: { type: 'figma' as const, url: `${FIGMA}${id}` } });

/* ── 01 · Overview ─────────────────────────────────────────────────────── */
export const Overview: Story = { parameters: design('22-3') };
export const OverviewLoading: Story = {
  name: 'Overview · Loading',
  beforeEach: scenario({ latency: 'hang' }),
};
export const OverviewError: Story = { name: 'Overview · Error', beforeEach: scenario({ errors: 'all' }) };
export const OverviewEmpty: Story = { name: 'Overview · Empty', beforeEach: scenario({ empty: true }) };
export const OverviewAugust: Story = { name: 'Overview · August', args: { url: '/overview?period=2026-08' } };
export const OverviewMobile: Story = {
  name: 'Overview · Mobile',
  parameters: { ...design('24-1277') },
  globals: { viewport: { value: 'mobile', isRotated: false } },
};

/* ── 02 · Zones ───────────────────────────────────────────────────────── */
export const Zones: Story = {
  args: { url: '/zones?selected=pool-heat-pump,rooms-floor-1' },
  parameters: design('25-1941'),
};
export const ZonesFiltered: Story = {
  name: 'Zones · Search with no results',
  args: { url: '/zones?q=sauna' },
};
export const ZonesLoading: Story = {
  name: 'Zones · Loading',
  args: { url: '/zones' },
  beforeEach: scenario({ latency: 'hang' }),
};
export const ZonesError: Story = {
  name: 'Zones · Error',
  args: { url: '/zones' },
  beforeEach: scenario({ errors: 'all' }),
};
export const ZonesEmpty: Story = {
  name: 'Zones · Empty',
  args: { url: '/zones' },
  beforeEach: scenario({ empty: true }),
};

/** Sorting, paging and selection all write to the URL. */
export const ZonesInteraction: Story = {
  name: 'Zones · Sort, page and select',
  args: { url: '/zones' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const costHeader = await canvas.findByRole('button', { name: /Cost/ }, { timeout: 4000 });
    await userEvent.click(costHeader);
    await expect(costHeader.closest('th')).toHaveAttribute('aria-sort', 'descending');
    await userEvent.click(await canvas.findByRole('checkbox', { name: 'Select Kitchen' }));
    await expect(await canvas.findByText('1 zone selected')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(await canvas.findByText('Showing 11–11 of 11 zones')).toBeVisible();
  },
};

/* ── 03 · Zone detail ─────────────────────────────────────────────────── */
export const ZoneDetail: Story = {
  name: 'Zone detail',
  args: { url: '/zones/climate' },
  parameters: design('26-3098'),
};
export const ZoneDetailPool: Story = {
  name: 'Zone detail · Pool, 7 days',
  args: { url: '/zones/pool?range=7d' },
};
export const ZoneDetailLoading: Story = {
  name: 'Zone detail · Loading',
  args: { url: '/zones/climate' },
  beforeEach: scenario({ latency: 'hang' }),
};
export const ZoneDetailError: Story = {
  name: 'Zone detail · Error',
  args: { url: '/zones/climate' },
  beforeEach: scenario({ errors: 'all' }),
};

/* ── 04 · Alerts ──────────────────────────────────────────────────────── */
export const Alerts: Story = { args: { url: '/alerts' }, parameters: design('27-3596') };
export const AlertsResolveModal: Story = {
  name: 'Alerts · Resolve modal',
  args: { url: '/alerts' },
  parameters: design('27-4467'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: 'Resolve new (3)' }, { timeout: 4000 }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByRole('dialog', { name: 'Resolve 3 alerts?' })).toBeVisible();
  },
};
export const AlertsNewTab: Story = { name: 'Alerts · New only', args: { url: '/alerts?status=new' } };
export const AlertsLoading: Story = {
  name: 'Alerts · Loading',
  args: { url: '/alerts' },
  beforeEach: scenario({ latency: 'hang' }),
};
export const AlertsError: Story = {
  name: 'Alerts · Error',
  args: { url: '/alerts' },
  beforeEach: scenario({ errors: 'all' }),
};
export const AlertsEmpty: Story = {
  name: 'Alerts · Empty',
  args: { url: '/alerts' },
  beforeEach: scenario({ empty: true }),
};

/* ── 05 · Settings ────────────────────────────────────────────────────── */
export const Settings: Story = { args: { url: '/settings' }, parameters: design('29-4644') };

/** Figma's Settings frame shows the contracted-power error and the save bar. */
export const SettingsValidation: Story = {
  name: 'Settings · Validation error',
  args: { url: '/settings' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const field = await canvas.findByLabelText('Contracted power (kW)', {}, { timeout: 4000 });
    await userEvent.clear(field);
    await userEvent.type(field, '4,5');
    await userEvent.tab();
    await expect(field).toHaveAttribute('aria-invalid', 'true');
    await expect(await canvas.findByText(/1 field needs attention/)).toBeVisible();
  },
};
export const SettingsLoading: Story = {
  name: 'Settings · Loading',
  args: { url: '/settings' },
  beforeEach: scenario({ latency: 'hang' }),
};
