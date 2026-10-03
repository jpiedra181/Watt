import type { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { PreferencesProvider } from '@/app/preferences';
import { routeTree } from '@/app/router';
import { DesignSystemProvider } from '@/components/DesignSystemProvider';

const testQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } },
  });

/** Renders a component inside the providers it expects (query client, router, design system). */
export function renderUi(ui: ReactElement) {
  const client = testQueryClient();
  const router = createRouter({
    routeTree: createRootRoute({ component: () => ui }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  return {
    user: userEvent.setup(),
    ...render(
      <QueryClientProvider client={client}>
        <DesignSystemProvider>
          <RouterProvider router={router as never} />
        </DesignSystemProvider>
      </QueryClientProvider>,
    ),
  };
}

/** Renders the whole app at a URL with the real route tree and the mock API. */
export function renderApp(url: string) {
  const client = testQueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient: client },
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  const utils = render(
    <QueryClientProvider client={client}>
      <PreferencesProvider>
        <DesignSystemProvider>
          <RouterProvider router={router} />
        </DesignSystemProvider>
      </PreferencesProvider>
    </QueryClientProvider>,
  );
  return { user: userEvent.setup(), router, ...utils };
}

/** axe-core on a container. Colour contrast can't be computed in jsdom — it is checked in Storybook. */
export async function axeViolations(container: Element) {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
  });
  return results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
  );
}
