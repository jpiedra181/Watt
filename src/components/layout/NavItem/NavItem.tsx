import type { ReactNode } from 'react';
import { Link, type LinkProps } from '@tanstack/react-router';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Tooltip } from '../../ui/Tooltip/Tooltip';

export interface NavItemProps {
  to: LinkProps['to'];
  search?: LinkProps['search'];
  hash?: string;
  icon: LucideIcon;
  label: string;
  /** Figma `Show count` — e.g. new alerts. In the collapsed rail it becomes a dot. */
  count?: number;
  /** Icon-only rail (Figma `Collapsed=True`); the label moves to a tooltip and the accessible name. */
  collapsed?: boolean;
  /** Force the active look (in-page anchors like the Settings nav). */
  active?: boolean;
  /** Match child routes too (Zones is active on /zones/climate). */
  fuzzy?: boolean;
  onClick?: () => void;
  className?: string;
}

const base = [
  'group relative flex h-36 shrink-0 items-center gap-10 rounded-md border border-transparent outline-none',
  'type-body-small-strong text-secondary transition-colors duration-75',
  'hover:bg-hover hover:text-primary',
  'focus-visible:border-focus focus-visible:text-primary focus-visible:shadow-focus-ring',
  'data-[status=active]:bg-selected data-[status=active]:text-brand',
  'aria-[current=page]:bg-selected aria-[current=page]:text-brand',
].join(' ');

const iconClass = cn(
  'shrink-0 text-icon-secondary',
  'group-hover:text-icon-primary group-focus-visible:text-icon-primary',
  'group-data-[status=active]:text-icon-brand group-aria-[current=page]:text-icon-brand',
);

/** Figma `Nav Item` (19:491) · Collapsed False/True × Default, Hover, Active, Focus. */
export function NavItem({
  to,
  search,
  hash,
  icon: Icon,
  label,
  count,
  collapsed,
  active,
  fuzzy,
  onClick,
  className,
}: NavItemProps) {
  const name = count ? `${label}, ${count} new` : label;
  const link = (
    <Link
      to={to}
      search={search}
      hash={hash}
      onClick={onClick}
      activeOptions={{ exact: !fuzzy, includeHash: Boolean(hash), includeSearch: false }}
      aria-label={collapsed || count ? name : undefined}
      aria-current={active ? 'page' : undefined}
      data-status={active ? 'active' : undefined}
      className={cn(base, collapsed ? 'w-44 justify-center px-0' : 'w-full px-10', className)}
    >
      <span className="relative flex">
        <Icon size={20} aria-hidden="true" className={iconClass} />
        {collapsed && count ? (
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-2 size-8 rounded-full border-2 border-[var(--color-bg-surface)] bg-brand"
          />
        ) : null}
      </span>
      {!collapsed && <span className="min-w-0 flex-1 truncate">{label}</span>}
      {!collapsed && count ? <CountPill>{count}</CountPill> : null}
    </Link>
  );
  return collapsed ? (
    <Tooltip content={label} side="right">
      {link}
    </Tooltip>
  ) : (
    link
  );
}

function CountPill({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 rounded-full bg-brand px-6 type-caption-strong tabular text-on-brand"
    >
      {children}
    </span>
  );
}
