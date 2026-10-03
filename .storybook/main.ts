import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    'storybook-addon-pseudo-states',
    '@storybook/addon-designs',
    'msw-storybook-addon',
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  // Serves mockServiceWorker.js so screen stories run against the same MSW handlers as the app.
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
};

export default config;
