import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '../src/styles/index.css';
import type { Preview } from '@storybook/react-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import { setupWorker } from 'msw/browser';
import { mswLoader } from 'msw-storybook-addon/csf3';
import { DesignSystemProvider } from '../src/components/DesignSystemProvider';
import { handlers } from '../src/mocks/handlers';
import { setScenario } from '../src/mocks/scenario';
import { StoryProviders } from '../src/stories/decorators';

// Stories talk to the same mock API as the app, answering fast unless a story asks otherwise.
setScenario({ latency: 'fast', errors: 'none', empty: false }, { persist: false });

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { expanded: true, sort: 'requiredFirst' },
    backgrounds: { disable: true },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Foundations',
          ['Colors', 'Typography', 'Spacing, radius & elevation', 'Icons'],
          'Components',
          ['Actions', 'Forms', 'Navigation', 'Feedback', 'Overlays', 'Data display', 'Charts', 'Layout'],
          'Screens',
        ],
      },
    },
  },
  decorators: [
    (Story, ctx) => (ctx.parameters.screen ? <Story /> : <StoryProviders>{() => <Story />}</StoryProviders>),
    withThemeByDataAttribute({
      themes: { Light: 'light', Dark: 'dark' },
      defaultTheme: 'Light',
      attributeName: 'data-theme',
    }),
    (Story) => (
      <DesignSystemProvider>
        <Story />
      </DesignSystemProvider>
    ),
  ],
  loaders: [
    // Relative worker URL: Storybook is published under /storybook on Netlify.
    mswLoader(async () => {
      const worker = setupWorker(...handlers);
      await worker.start({
        serviceWorker: { url: './mockServiceWorker.js' },
        onUnhandledRequest: 'bypass',
        quiet: true,
      });
      return worker;
    }),
  ],
  tags: ['autodocs'],
};

export default preview;
