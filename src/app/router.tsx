import type { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  lazyRouteComponent,
  notFound,
  redirect,
  retainSearchParams,
} from '@tanstack/react-router';
import { ZoneType } from '@/api/schemas';
import { AppShell } from './AppShell';
import { NotFoundPage } from './NotFoundPage';
import { createQueryClient } from './queryClient';
import { alertsSearch, rootSearch, zoneDetailSearch, zonesSearch } from './search';

export const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  validateSearch: rootSearch,
  // The reporting period follows you from page to page.
  search: { middlewares: [retainSearchParams(['period'])] },
  component: AppShell,
  notFoundComponent: NotFoundPage,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: ({ search }) => {
    throw redirect({ to: '/overview', search, replace: true });
  },
});

export const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'overview',
  component: lazyRouteComponent(() => import('@/routes/overview/OverviewPage'), 'OverviewPage'),
});

export const zonesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'zones',
  validateSearch: zonesSearch,
  component: lazyRouteComponent(() => import('@/routes/zones/ZonesPage'), 'ZonesPage'),
});

export const zoneDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'zones/$type',
  validateSearch: zoneDetailSearch,
  params: {
    parse: (raw) => {
      const r = ZoneType.safeParse(raw.type);
      if (!r.success) throw notFound();
      return { type: r.data };
    },
    stringify: (p) => ({ type: p.type }),
  },
  component: lazyRouteComponent(() => import('@/routes/zone-detail/ZoneDetailPage'), 'ZoneDetailPage'),
});

export const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'alerts',
  validateSearch: alertsSearch,
  component: lazyRouteComponent(() => import('@/routes/alerts/AlertsPage'), 'AlertsPage'),
});

export const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'settings',
  component: lazyRouteComponent(() => import('@/routes/settings/SettingsPage'), 'SettingsPage'),
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  overviewRoute,
  zonesRoute,
  zoneDetailRoute,
  alertsRoute,
  settingsRoute,
]);

export const queryClient = createQueryClient();

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  defaultNotFoundComponent: NotFoundPage,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
