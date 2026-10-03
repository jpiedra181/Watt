import type { Meta, StoryObj } from '@storybook/react-vite';
import tokens from '../../tokens/figma-variables.json';
import { figmaIcons } from '@/components/ui/icons';
import { figma } from './helpers';

/**
 * Foundations, rendered straight from `tokens/figma-variables.json` — the same export that
 * `npm run tokens` turns into CSS. If a value changes in Figma, these pages change with it.
 */
const meta = {
  title: 'Foundations',
  parameters: { layout: 'padded', ...figma('4:4') },
  tags: ['!autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

type Vars = Record<string, { type: string; values: Record<string, string | number> }>;
const primitives = tokens.collections.Primitives.variables as Vars;
const theme = tokens.collections.Theme.variables as Vars;
const slug = (n: string) => n.toLowerCase().replace(/[\s/]+/g, '-');

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-40 flex flex-col gap-16">
      <header className="flex flex-col gap-4">
        <h2 className="type-heading-section text-primary">{title}</h2>
        {description && <p className="max-w-[720px] type-body-small text-secondary">{description}</p>}
      </header>
      {children}
    </section>
  );
}

export const Colors: Story = {
  render: () => {
    const ramps = new Map<string, string[]>();
    for (const name of Object.keys(primitives)) {
      if (primitives[name]!.type !== 'COLOR') continue;
      const ramp = name.split('/').slice(0, -1).join('/');
      ramps.set(ramp, [...(ramps.get(ramp) ?? []), name]);
    }
    const groups = new Map<string, string[]>();
    for (const name of Object.keys(theme)) {
      const g = name.split('/')[0]!;
      groups.set(g, [...(groups.get(g) ?? []), name]);
    }
    return (
      <div className="max-w-[1180px]">
        <h1 className="mb-8 type-doc-title text-primary">Color</h1>
        <p className="mb-40 max-w-[720px] type-doc-body text-secondary">
          Two collections. <strong>Primitives</strong> are raw ramps and are never used by components.{' '}
          <strong>Theme</strong> tokens alias them per mode (Light / Dark) and are exposed as CSS variables
          named like Figma’s code syntax (<code className="type-data-mono">var(--color-bg-surface)</code>) and
          as semantic utilities (<code className="type-data-mono">bg-surface</code>,{' '}
          <code className="type-data-mono">text-secondary</code>…). Switch the theme in the toolbar to see the
          Dark mode.
        </p>
        <Section
          title="Theme tokens"
          description="Status colours are reserved for consumption state; brand (indigo) is for actions and selection."
        >
          {[...groups].map(([group, names]) => (
            <div key={group} className="flex flex-col gap-8">
              <h3 className="type-label-overline text-tertiary">{group}</h3>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-8">
                {names.map((n) => (
                  <li
                    key={n}
                    className="flex items-center gap-12 rounded-md border border-default bg-surface p-8"
                  >
                    <span
                      className="size-36 shrink-0 rounded-sm border border-subtle"
                      style={{ background: `var(--color-${slug(n)})` }}
                    />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate type-body-small-strong text-primary">{n}</span>
                      <span className="truncate type-caption text-tertiary">
                        {String(theme[n]!.values.Light).slice(1, -1)} ·{' '}
                        {String(theme[n]!.values.Dark).slice(1, -1)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
        <Section title="Primitives">
          {[...ramps].map(([ramp, names]) => (
            <div key={ramp} className="flex items-center gap-12">
              <span className="w-96 shrink-0 type-caption-strong text-secondary">{ramp}</span>
              <div className="flex flex-1 overflow-hidden rounded-md border border-subtle">
                {names.map((n) => (
                  <span
                    key={n}
                    title={`${n} ${primitives[n]!.values.Value}`}
                    className="flex h-48 flex-1 items-end p-4"
                    style={{ background: String(primitives[n]!.values.Value) }}
                  >
                    <span className="rounded-xs bg-surface/80 px-2 type-data-axis text-primary">
                      {n.split('/').at(-1)}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Section>
      </div>
    );
  },
};

export const Typography: Story = {
  render: () => (
    <div className="max-w-[1000px]">
      <h1 className="mb-8 type-doc-title text-primary">Typography</h1>
      <p className="mb-32 max-w-[720px] type-doc-body text-secondary">
        Geist for interface text, Geist Mono for numbers that line up (tables, axes, meter readings). Each
        Figma text style is a<code className="type-data-mono"> type-*</code> utility generated by the token
        script.
      </p>
      <ul className="flex flex-col divide-y divide-subtle rounded-lg border border-default bg-surface">
        {Object.entries(tokens.textStyles).map(([name, s]) => {
          const cls = `type-${slug(name).replace(/-default$/, '')}`;
          return (
            <li key={name} className="grid grid-cols-[220px_1fr] items-baseline gap-24 px-20 py-16">
              <span className="flex flex-col">
                <span className="type-body-small-strong text-primary">{name}</span>
                <span className="type-caption text-tertiary">
                  {s.family} · {s.weight} · {s.size}/{s.lineHeight} · {s.letterSpacing}px
                </span>
                <code className="type-data-axis text-tertiary">{cls}</code>
              </span>
              <span className={`${cls} truncate text-primary`}>
                {s.family === 'Geist Mono' ? '4,812 kWh · 19:42' : 'Consumption by hour'}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  ),
};

export const SpacingRadiusElevation: Story = {
  name: 'Spacing, radius & elevation',
  render: () => {
    const space = Object.entries(primitives).filter(([n]) => n.startsWith('space/'));
    const radius = Object.entries(primitives).filter(([n]) => n.startsWith('radius/'));
    return (
      <div className="max-w-[1000px]">
        <h1 className="mb-32 type-doc-title text-primary">Spacing, radius & elevation</h1>
        <Section
          title="Spacing"
          description="1 Tailwind unit = 1px, so p-16 or gap-8 read exactly like the Figma values; named steps map to var(--space-*)."
        >
          <ul className="flex flex-col gap-8">
            {space.map(([n, v]) => (
              <li key={n} className="flex items-center gap-16">
                <code className="w-96 type-data-mono text-secondary">{n}</code>
                <span className="h-12 rounded-xs bg-brand" style={{ width: Number(v.values.Value) || 1 }} />
                <span className="type-caption text-tertiary">{v.values.Value}px</span>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Radius">
          <div className="flex flex-wrap gap-16">
            {radius.map(([n, v]) => (
              <div key={n} className="flex flex-col items-center gap-8">
                <span
                  className="size-64 border-2 border-brand bg-brand-subtle"
                  style={{ borderRadius: Math.min(Number(v.values.Value), 32) }}
                />
                <code className="type-data-axis text-secondary">
                  {n} · {v.values.Value}
                </code>
              </div>
            ))}
          </div>
        </Section>
        <Section
          title="Elevation & focus"
          description="Elevation/1 cards on hover · Elevation/2 menus, toasts, tooltips · Elevation/3 dialogs · Focus/Ring on every focusable control."
        >
          <div className="flex flex-wrap gap-24 rounded-lg bg-canvas p-24">
            {(
              [
                ['Elevation/1', 'shadow-elevation-1'],
                ['Elevation/2', 'shadow-elevation-2'],
                ['Elevation/3', 'shadow-elevation-3'],
                ['Focus/Ring', 'shadow-focus-ring'],
              ] as const
            ).map(([name, cls]) => (
              <div
                key={name}
                className={`flex h-96 w-160 items-center justify-center rounded-lg border border-default bg-surface-raised type-body-small-strong text-secondary ${cls}`}
              >
                {name}
              </div>
            ))}
          </div>
        </Section>
      </div>
    );
  },
};

export const Icons: Story = {
  parameters: { ...figma('6:7') },
  render: () => (
    <div className="max-w-[1000px]">
      <h1 className="mb-8 type-doc-title text-primary">Icons</h1>
      <p className="mb-32 max-w-[720px] type-doc-body text-secondary">
        The 51 Figma icons use Lucide geometry with a fixed 1.67px stroke at every size. They come from
        lucide-react with an absolute stroke width set once in the design-system provider.
      </p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-8">
        {Object.entries(figmaIcons).map(([name, Icon]) => (
          <li
            key={name}
            className="flex flex-col items-center gap-8 rounded-md border border-default bg-surface p-12"
          >
            <Icon size={20} aria-hidden="true" className="text-icon-primary" />
            <span className="type-caption text-secondary">{name}</span>
          </li>
        ))}
      </ul>
    </div>
  ),
};
