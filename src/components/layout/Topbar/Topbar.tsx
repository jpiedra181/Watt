import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { Bell, Calendar, ChevronDown, FlaskConical, Menu, Moon, Settings, Sun } from 'lucide-react';
import type { Period } from '@/api/schemas';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { cn } from '@/lib/cn';
import { Avatar } from '../../ui/Avatar/Avatar';
import { buttonVariants } from '../../ui/Button/Button';
import { IconButton, iconButtonVariants } from '../../ui/IconButton/IconButton';
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
import { Tooltip } from '../../ui/Tooltip/Tooltip';
import { GlobalSearch } from './GlobalSearch';

export interface TopbarProps {
  periods: Period[];
  period: Period | undefined;
  onPeriodChange: (id: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  newAlerts: number;
  user?: { name: string; initials: string; role: string };
  onOpenMenu: () => void;
  onOpenDemo: () => void;
  onOpenSettings: () => void;
}

/**
 * Figma `Topbar` (19:789) · Desktop (search 360), Tablet (search 240, short period), Mobile
 * (menu · logo · notifications · account). Search and period move into the menu on mobile.
 */
export function Topbar({
  periods,
  period,
  onPeriodChange,
  theme,
  onToggleTheme,
  newAlerts,
  user,
  onOpenMenu,
  onOpenDemo,
  onOpenSettings,
}: TopbarProps) {
  const wide = useMediaQuery('(min-width: 1280px)');
  return (
    <header className="sticky top-0 z-30 flex h-56 shrink-0 items-center gap-12 border-b border-default bg-surface px-16 md:h-64 md:px-32">
      <IconButton
        variant="ghost"
        icon={Menu}
        label="Open menu"
        tooltip={false}
        onClick={onOpenMenu}
        className="md:hidden"
      />
      <Link
        to="/overview"
        className="rounded-md outline-none focus-visible:shadow-focus-ring md:hidden"
        aria-label="Watt — Overview"
      >
        <Logo />
      </Link>
      <GlobalSearch
        className="hidden md:block md:w-240 xl:w-360"
        placeholder={wide ? 'Search zones, meters, alerts…' : 'Search…'}
      />
      <div className="flex-1" />
      <PeriodMenu periods={periods} period={period} onChange={onPeriodChange} className="max-md:hidden" />
      <IconButton
        variant="ghost"
        icon={theme === 'dark' ? Sun : Moon}
        label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={onToggleTheme}
        className="max-md:hidden"
      />
      <NotificationsLink count={newAlerts} />
      <AccountMenu user={user} onOpenDemo={onOpenDemo} onOpenSettings={onOpenSettings} />
    </header>
  );
}

export function PeriodMenu({
  periods,
  period,
  onChange,
  className,
  fullWidth,
}: {
  periods: Period[];
  period: Period | undefined;
  onChange: (id: string) => void;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={period ? `Period: ${period.label}` : 'Period'}
          className={cn(
            buttonVariants({ variant: 'secondary' }),
            fullWidth && 'w-full justify-start',
            className,
          )}
        >
          <Calendar size={16} aria-hidden="true" className="shrink-0 text-icon-primary" />
          <span className={cn('tabular', fullWidth && 'flex-1 text-left')}>
            <span className="lg:hidden xl:inline">{period?.label ?? '—'}</span>
            <span className="hidden lg:inline xl:hidden">{period?.shortLabel ?? '—'}</span>
          </span>
          <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-icon-primary" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        <DropdownMenuLabel>Reporting period</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={period?.id} onValueChange={onChange}>
          {periods.map((p) => (
            <DropdownMenuRadioItem key={p.id} value={p.id} icon={Calendar}>
              {p.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationsLink({ count }: { count: number }) {
  const label = count ? `Alerts, ${count} new` : 'Alerts';
  return (
    <Tooltip content={label}>
      <Link
        to="/alerts"
        search={{ status: count ? 'new' : undefined }}
        aria-label={label}
        className={cn(iconButtonVariants({ variant: 'ghost' }), 'relative')}
      >
        <Bell size={16} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute left-[19px] top-[6px] size-12 rounded-full border-2 border-[var(--color-bg-surface)] bg-critical-solid"
          />
        )}
      </Link>
    </Tooltip>
  );
}

function AccountMenu({
  user,
  onOpenDemo,
  onOpenSettings,
}: {
  user?: TopbarProps['user'];
  onOpenDemo: () => void;
  onOpenSettings: () => void;
}): ReactNode {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={user ? `Account: ${user.name}` : 'Account'}
          className="shrink-0 cursor-pointer rounded-full outline-none focus-visible:shadow-focus-ring"
        >
          <Avatar initials={user?.initials ?? '··'} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-[240px]">
        {user && (
          <div className="flex items-center gap-10 px-8 py-8">
            <Avatar initials={user.initials} />
            <div className="flex min-w-0 flex-col">
              <span className="truncate type-body-small-strong text-primary">{user.name}</span>
              <span className="truncate type-caption text-tertiary">{user.role} · Casa Rural El Olivar</span>
            </div>
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={Settings} onSelect={onOpenSettings}>
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem icon={FlaskConical} onSelect={onOpenDemo}>
          Demo controls…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
