import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Layers, LayoutDashboard, Settings } from 'lucide-react';
import { expect, fn, userEvent } from 'storybook/test';
import { periods } from '@/mocks/db';
import { figma, StateGrid, withFrame } from '@/stories/helpers';
import { ContractedPowerMeter } from './ContractedPowerMeter/ContractedPowerMeter';
import { NavItem } from './NavItem/NavItem';
import { Card, PageHeader } from './Page/Page';
import { Sidebar } from './Sidebar/Sidebar';
import { Topbar } from './Topbar/Topbar';

const property = { name: 'Casa Rural El Olivar', location: 'Ronda', rooms: 14 };
const user = { name: 'Lucía Martín', initials: 'LM', role: 'Manager' };

const meta = {
  title: 'Components/Layout/Sidebar',
  component: Sidebar,
  parameters: { ...figma('19:674'), layout: 'fullscreen' },
  args: { property, user, newAlerts: 3, power: { nowKw: 38.2, contractedKw: 45 }, onToggleCollapsed: fn() },
  decorators: [withFrame('flex h-[900px]')],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma `State=Expanded` — 240px. */
export const Expanded: Story = {};
/** Figma `State=Collapsed` — 72px icon rail; labels move to tooltips and accessible names. */
export const Collapsed: Story = {
  args: { collapsed: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Alerts, 3 new' })).toBeVisible();
  },
};
/** Phone menu (inside a dialog): always expanded, with a close button. */
export const Drawer: Story = { args: { variant: 'drawer', onClose: fn() } };
export const Loading: Story = {
  args: { property: undefined, user: undefined, power: undefined, newAlerts: undefined },
};

/** Figma `Nav Item` (19:491) · Collapsed False/True × Default, Hover, Active, Focus. */
export const NavItemStates: Story = {
  name: 'Nav Item · all states',
  parameters: {
    ...figma('19:491'),
    layout: 'padded',
    fullWidth: true,
    pseudo: { hover: ["[data-demo='hover'] a"], focusVisible: ["[data-demo='focus'] a"] },
  },
  render: () => (
    <StateGrid
      cellWidth={216}
      columns={['Default', 'Hover', 'Active', 'Focus']}
      rows={[false, true].map((collapsed) => ({
        label: collapsed ? 'Collapsed' : 'Expanded',
        cells: ['Default', 'Hover', 'Active', 'Focus'].map((s) => (
          <div key={s} className={collapsed ? 'w-44' : 'w-[216px]'}>
            <NavItem
              to="/zones"
              icon={LayoutDashboard}
              label="Overview"
              collapsed={collapsed}
              active={s === 'Active'}
            />
          </div>
        )),
      }))}
    />
  ),
};

export const NavItemsWithCount: Story = {
  name: 'Nav Item · with count',
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="w-[216px]">{Story()}</div>],
  render: () => (
    <nav aria-label="Demo" className="flex flex-col gap-2">
      <NavItem to="/overview" icon={LayoutDashboard} label="Overview" />
      <NavItem to="/zones" icon={Layers} label="Zones" />
      <NavItem to="/alerts" icon={Bell} label="Alerts" count={3} />
      <NavItem to="/settings" icon={Settings} label="Settings" />
    </nav>
  ),
};

/** Sidebar meter: Normal < 80% ≤ Attention ≤ 100% < Alert (status semantics). */
export const PowerMeter: Story = {
  name: 'Contracted power meter',
  parameters: { layout: 'padded', fullWidth: true },
  render: () => (
    <div className="flex gap-16">
      {[28.4, 38.2, 52.4].map((kw) => (
        <div key={kw} className="w-[216px]">
          <ContractedPowerMeter nowKw={kw} contractedKw={45} />
        </div>
      ))}
    </div>
  ),
};

const topbarArgs = {
  periods: periods(),
  period: periods()[0],
  onPeriodChange: fn(),
  theme: 'light' as const,
  onToggleTheme: fn(),
  newAlerts: 3,
  user,
  onOpenMenu: fn(),
  onOpenDemo: fn(),
  onOpenSettings: fn(),
};

/** Figma `Topbar` (19:789) · Breakpoint=Desktop. Resize the viewport for Tablet and Mobile. */
export const TopbarDesktop: Story = {
  name: 'Topbar · Desktop',
  parameters: { ...figma('19:789') },
  decorators: [(Story) => <div className="w-[1200px]">{Story()}</div>],
  render: () => <Topbar {...topbarArgs} />,
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('combobox', { name: 'Search zones, meters and alerts' }));
    await userEvent.keyboard('pool');
    await expect(
      await canvas.findByRole('option', { name: /Pool heat pump/ }, { timeout: 3000 }),
    ).toBeVisible();
  },
};
export const TopbarTablet: Story = {
  name: 'Topbar · Tablet',
  globals: { viewport: { value: 'tablet', isRotated: false } },
  parameters: {
    viewport: { options: { tablet: { name: 'Tablet 1024', styles: { width: '1024px', height: '768px' } } } },
  },
  render: () => <Topbar {...topbarArgs} />,
};
export const TopbarMobile: Story = {
  name: 'Topbar · Mobile',
  globals: { viewport: { value: 'mobile', isRotated: false } },
  parameters: {
    viewport: { options: { mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' } } } },
  },
  render: () => <Topbar {...topbarArgs} />,
};

/** Page title + section card used by every screen. */
export const PageChrome: Story = {
  name: 'Page header & card',
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="flex w-[900px] flex-col gap-24">{Story()}</div>],
  render: () => (
    <>
      <PageHeader
        title="Overview"
        subtitle="Tuesday, 30 September · Casa Rural El Olivar · updated 2 min ago"
      />
      <Card title="By zone" subtitle="September · 4,812 kWh">
        <p className="type-body-small text-secondary">Card content</p>
      </Card>
    </>
  ),
};
