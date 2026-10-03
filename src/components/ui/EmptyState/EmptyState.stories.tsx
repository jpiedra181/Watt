import type { Meta, StoryObj } from '@storybook/react-vite';
import { Plus, RefreshCw } from 'lucide-react';
import { figma } from '@/stories/helpers';
import { Button } from '../Button/Button';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Components/Feedback/Empty State',
  component: EmptyState,
  parameters: { ...figma('20:658') },
  decorators: [
    (Story) => <div className="w-[400px] rounded-lg border border-default bg-surface">{Story()}</div>,
  ],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoData: Story = {
  args: {
    variant: 'no-data',
    title: 'No readings yet',
    description: 'Connect a meter to start tracking this zone. Data appears within 15 minutes.',
    action: <Button leadingIcon={Plus}>Connect meter</Button>,
  },
};

export const NoResults: Story = {
  args: {
    variant: 'no-results',
    title: 'No zones match “sauna”',
    description: 'Try another name or clear the filters to see all 11 zones.',
    action: <Button variant="secondary">Clear filters</Button>,
  },
};

/** Errors use role="alert" so the failure is announced when it replaces content. */
export const Error: Story = {
  args: {
    variant: 'error',
    title: 'Couldn’t load zones',
    description: 'The meter gateway didn’t respond. Your data is safe — try again in a moment.',
    action: (
      <Button variant="secondary" leadingIcon={RefreshCw}>
        Retry
      </Button>
    ),
  },
};

export const WithoutAction: Story = {
  args: { variant: 'no-data', title: 'No readings yet', description: 'Data appears within 15 minutes.' },
};
