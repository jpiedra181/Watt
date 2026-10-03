import { useState, type ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { PreferencesProvider } from '@/app/preferences';
import { routeTree } from '@/app/router';
import { setScenario, type Scenario } from '@/mocks/scenario';
import { resetDb } from '@/mocks/db';

const storyQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity, refetchOnWindowFocus: false } },
  });

/**
 * Wraps a component story in a fresh QueryClient and a memory router, so components that render
 * router <Link>s or read queries work in isolation. Links navigate inside the story harmlessly.
 */
export function StoryProviders({ children }: { children: () => ReactElement }) {
  const [client] = useState(storyQueryClient);
  const [router] = useState(() =>
    createRouter({
      routeTree: createRootRoute({ component: () => children() }),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    }),
  );
  return (
    <QueryClientProvider client={client}>
      <RouterProvider router={router as never} />
    </QueryClientProvider>
  );
}

/** The whole app at a URL, backed by the MSW mock API — used by the Screens stories. */
export function AppAt({ url }: { url: string }) {
  const [client] = useState(storyQueryClient);
  const [router] = useState(() =>
    createRouter({
      routeTree,
      context: { queryClient: client },
      history: createMemoryHistory({ initialEntries: [url] }),
    }),
  );
  return (
    <QueryClientProvider client={client}>
      <PreferencesProvider>
        <RouterProvider router={router} />
      </PreferencesProvider>
    </QueryClientProvider>
  );
}

/** Sets the mock API scenario for one story (not persisted). */
export const scenario = (s: Partial<Scenario>) => () => {
  resetDb();
  setScenario({ latency: 'fast', errors: 'none', empty: false, ...s }, { persist: false });
};
