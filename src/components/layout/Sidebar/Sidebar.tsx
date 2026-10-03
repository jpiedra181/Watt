import type { ReactNode } from 'react';
import {
  Bell,
  Building,
  ChevronsUpDown,
  Layers,
  LayoutDashboard,
  PanelLeft,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Avatar } from '../../ui/Avatar/Avatar';
import { IconButton } from '../../ui/IconButton/IconButton';
import { Logo } from '../../ui/Logo/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/Menu/DropdownMenu';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import { ContractedPowerMeter } from '../ContractedPowerMeter/ContractedPowerMeter';
import { NavItem } from '../NavItem/NavItem';

export interface SidebarProps {
  /** Figma `State`: Expanded (240) or Collapsed (72 icon rail). */
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  /** `drawer` = mobile navigation inside a dialog: always expanded, with a close button. */
  variant?: 'rail' | 'drawer';
  onClose?: () => void;
  /** Called after a navigation link is followed (closes the mobile drawer). */
  onNavigate?: () => void;
  property?: { name: string; location: string; rooms: number };
  user?: { name: string; initials: string; role: string };
  newAlerts?: number;
  power?: { nowKw: number; contractedKw: number };
  /** Extra controls under the property switcher (mobile: search, period, theme). */
  extra?: ReactNode;
  className?: string;
}

/**
 * Figma `Sidebar` (19:674). Fills the viewport height; the spacer pushes the contracted-power meter
 * and the user to the bottom.
 */
export function Sidebar({
  collapsed = false,
  onToggleCollapsed,
  variant = 'rail',
  onClose,
  onNavigate,
  property,
  user,
  newAlerts,
  power,
  extra,
  className,
}: SidebarProps) {
  const isCollapsed = variant === 'rail' && collapsed;
  return (
    <div
      className={cn(
        'flex h-full flex-col gap-20 overflow-y-auto overflow-x-hidden bg-surface px-12 py-16',
        variant === 'rail' && 'border-r border-default',
        isCollapsed ? 'w-72 items-center' : 'w-240',
        className,
      )}
    >
      <div className={cn('flex items-center gap-8', isCollapsed ? 'flex-col' : 'justify-between pl-4')}>
        <Logo variant={isCollapsed ? 'mark' : 'full'} />
        {variant === 'drawer' ? (
          <IconButton variant="ghost" icon={X} label="Close menu" tooltip={false} onClick={onClose} />
        ) : (
          <IconButton
            variant="ghost"
            icon={PanelLeft}
            label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            tooltipSide={isCollapsed ? 'right' : 'bottom'}
            onClick={onToggleCollapsed}
          />
        )}
      </div>

      <PropertySwitcher collapsed={isCollapsed} property={property} />

      {extra && !isCollapsed && <div className="flex flex-col gap-12">{extra}</div>}

      <nav aria-label="Main" className={cn('flex flex-col gap-2', isCollapsed ? 'items-center' : 'w-full')}>
        {!isCollapsed && (
          <p className="px-10 pb-6 type-label-overline text-tertiary" aria-hidden="true">
            Monitor
          </p>
        )}
        <NavItem
          to="/overview"
          icon={LayoutDashboard}
          label="Overview"
          collapsed={isCollapsed}
          onClick={onNavigate}
        />
        <NavItem to="/zones" icon={Layers} label="Zones" collapsed={isCollapsed} fuzzy onClick={onNavigate} />
        <NavItem
          to="/alerts"
          icon={Bell}
          label="Alerts"
          count={newAlerts || undefined}
          collapsed={isCollapsed}
          onClick={onNavigate}
        />
        <NavItem
          to="/settings"
          icon={Settings}
          label="Settings"
          collapsed={isCollapsed}
          onClick={onNavigate}
        />
      </nav>

      <div className="min-h-16 flex-1" aria-hidden="true" />

      {!isCollapsed &&
        (power ? (
          <ContractedPowerMeter nowKw={power.nowKw} contractedKw={power.contractedKw} />
        ) : (
          <div className="flex flex-col gap-10 rounded-md bg-subtle p-12" aria-hidden="true">
            <Skeleton width={120} height={10} />
            <Skeleton width="100%" height={6} />
            <Skeleton width={110} height={10} />
          </div>
        ))}

      <div className={cn('flex items-center gap-10', isCollapsed ? 'p-0' : 'w-full p-4')}>
        {user ? (
          isCollapsed ? (
            <Avatar initials={user.initials} name={`${user.name}, ${user.role}`} />
          ) : (
            <>
              <Avatar initials={user.initials} />
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate type-body-small-strong text-primary">{user.name}</p>
                <p className="truncate type-caption text-tertiary">{user.role}</p>
              </div>
            </>
          )
        ) : (
          <Skeleton shape="circle" />
        )}
      </div>
    </div>
  );
}

function PropertySwitcher({
  collapsed,
  property,
}: {
  collapsed: boolean;
  property?: SidebarProps['property'];
}) {
  const name = property?.name ?? 'Loading property';
  const trigger = (
    <button
      type="button"
      aria-label={collapsed ? `${name} — switch property` : undefined}
      className={cn(
        'group flex shrink-0 cursor-pointer items-center gap-10 rounded-md border border-default text-left outline-none',
        'transition-colors duration-75 hover:bg-hover focus-visible:border-focus focus-visible:shadow-focus-ring',
        collapsed ? 'p-6' : 'w-full p-8',
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-32 shrink-0 items-center justify-center rounded-sm bg-brand-subtle text-icon-brand"
      >
        <Building size={16} />
      </span>
      {!collapsed && (
        <>
          <span className="flex min-w-0 flex-1 flex-col">
            {property ? (
              <>
                <span className="truncate type-body-small-strong text-primary">{property.name}</span>
                <span className="truncate type-caption text-tertiary group-hover:text-secondary">
                  {property.location} · {property.rooms} rooms
                </span>
              </>
            ) : (
              <span className="flex flex-col gap-6 py-2">
                <Skeleton width={120} height={10} />
                <Skeleton width={80} height={8} />
              </span>
            )}
          </span>
          <ChevronsUpDown size={16} aria-hidden="true" className="shrink-0 text-icon-secondary" />
        </>
      )}
    </button>
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" side={collapsed ? 'right' : 'bottom'} className="w-[240px]">
        <DropdownMenuLabel>Properties</DropdownMenuLabel>
        <DropdownMenuRadioGroup value="olivar">
          <DropdownMenuRadioItem value="olivar" icon={Building}>
            {name}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={Plus} disabled>
          Add property
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
