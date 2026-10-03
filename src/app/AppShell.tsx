import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Moon, Sun } from 'lucide-react';
import { Dialog } from 'radix-ui';
import { queries } from '@/api/queries';
import { Sidebar } from '@/components/layout/Sidebar/Sidebar';
import { GlobalSearch } from '@/components/layout/Topbar/GlobalSearch';
import { PeriodMenu, Topbar } from '@/components/layout/Topbar/Topbar';
import { Button } from '@/components/ui/Button/Button';
import { cn } from '@/lib/cn';
import { DemoControls } from './DemoControls';
import { useMediaQuery, usePreferences } from './preferences';
import { usePeriod } from './usePeriod';

/**
 * Layout: sidebar (expanded ≥ 1280, icon rail 768–1279, drawer below 768) + topbar + routed page.
 * After every client-side navigation focus moves to the new page's <h1>.
 */
export function AppShell() {
  const { theme, toggleTheme, sidebarCollapsed, setSidebarCollapsed } = usePreferences();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const property = useQuery(queries.property());
  const { period, periods, setPeriod } = usePeriod();
  const navigate = useNavigate();
  const isPhone = !useMediaQuery('(min-width: 768px)');
  const p = property.data;

  useFocusPageTitleOnNavigation();

  const sidebarData = {
    property: p ? { name: p.name, location: p.location, rooms: p.rooms } : undefined,
    user: p?.user,
    newAlerts: p?.newAlerts,
    power: p ? { nowKw: p.demandKw, contractedKw: p.contractedKw } : undefined,
  };

  return (
    <div className="flex min-h-dvh bg-canvas">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-12 py-8 type-body-small-strong text-brand shadow-elevation-2 focus:not-sr-only focus:fixed focus:left-16 focus:top-16 focus:outline-none focus:shadow-focus-ring"
      >
        Skip to content
      </a>

      <aside aria-label="Sidebar" className="sticky top-0 hidden h-dvh shrink-0 md:block">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          {...sidebarData}
        />
      </aside>

      <Dialog.Root open={drawerOpen && isPhone} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-scrim md:hidden" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-y-0 left-0 z-50 flex max-w-[86vw] shadow-elevation-3 outline-none md:hidden"
          >
            <Dialog.Title className="sr-only">Menu</Dialog.Title>
            <Sidebar
              variant="drawer"
              onClose={() => setDrawerOpen(false)}
              onNavigate={() => setDrawerOpen(false)}
              className="w-[280px] max-w-full"
              extra={
                <>
                  <GlobalSearch placeholder="Search…" />
                  <PeriodMenu periods={periods} period={period} onChange={setPeriod} fullWidth />
                  <Button
                    variant="secondary"
                    leadingIcon={theme === 'dark' ? Sun : Moon}
                    onClick={toggleTheme}
                    className="w-full justify-start"
                  >
                    {theme === 'dark' ? 'Light theme' : 'Dark theme'}
                  </Button>
                </>
              }
              {...sidebarData}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          periods={periods}
          period={period}
          onPeriodChange={setPeriod}
          theme={theme}
          onToggleTheme={toggleTheme}
          newAlerts={p?.newAlerts ?? 0}
          user={p?.user}
          onOpenMenu={() => setDrawerOpen(true)}
          onOpenDemo={() => setDemoOpen(true)}
          onOpenSettings={() => void navigate({ to: '/settings' })}
        />
        <main id="main" tabIndex={-1} className={cn('min-w-0 flex-1 outline-none')}>
          <Outlet />
        </main>
      </div>

      <DemoControls open={demoOpen} onOpenChange={setDemoOpen} />
    </div>
  );
}

function useFocusPageTitleOnNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Compare with the previous path (not a "first render" flag) so StrictMode's double effect and
  // the initial load leave focus at the top of the document.
  const previous = useRef(pathname);
  useEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    let tries = 0;
    const focus = () => {
      const h1 = document.querySelector<HTMLElement>('[data-page-title]');
      if (h1) h1.focus({ preventScroll: true });
      else if (tries++ < 20) requestAnimationFrame(focus);
    };
    requestAnimationFrame(focus);
  }, [pathname]);
}
