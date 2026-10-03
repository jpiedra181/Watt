import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@/styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { DesignSystemProvider } from '@/components/DesignSystemProvider';
import { startMockApi } from '@/mocks/browser';
import { applyDemoParam } from './DemoControls';
import { PreferencesProvider } from './preferences';
import { queryClient, router } from './router';

async function bootstrap() {
  applyDemoParam();
  await startMockApi();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <PreferencesProvider>
          <DesignSystemProvider>
            <RouterProvider router={router} />
          </DesignSystemProvider>
        </PreferencesProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}

void bootstrap();
