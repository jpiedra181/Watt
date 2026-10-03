import type { Meta, StoryObj } from '@storybook/react-vite';
import { Toast as T } from 'radix-ui';
import { expect, userEvent, within } from 'storybook/test';
import { figma } from '@/stories/helpers';
import { Button } from '../Button/Button';
import { ToastCard, useToast, type ToastOptions } from './Toast';

const examples: ToastOptions[] = [
  {
    tone: 'success',
    title: 'Settings saved',
    description: 'Alert thresholds updated for 6 zones.',
    action: { label: 'Undo', onClick: () => {} },
  },
  {
    tone: 'warning',
    title: 'Pool consumption rising',
    description: '18% above the typical Tuesday since 17:00.',
    action: { label: 'View zone', onClick: () => {} },
  },
  {
    tone: 'error',
    title: 'Couldn’t sync meter',
    description: 'Kitchen meter K-02 has not reported for 30 min.',
    action: { label: 'Retry', onClick: () => {} },
  },
  {
    tone: 'info',
    title: 'Monthly report ready',
    description: 'September 2026 · 4,812 kWh · €1,032.75',
    action: { label: 'Download', onClick: () => {} },
  },
];

const meta = {
  title: 'Components/Feedback/Toast',
  component: ToastCard,
  parameters: { ...figma('13:454'), layout: 'padded' },
  args: examples[0]!,
} satisfies Meta<typeof ToastCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma `Tone` = Success, Warning, Error, Info — static, rendered in place. */
export const AllTones: Story = {
  render: () => (
    <T.Provider>
      {examples.map((t) => (
        <ToastCard key={t.tone} {...t} open duration={Infinity} />
      ))}
      <T.Viewport className="m-0 flex list-none flex-wrap gap-16 p-0" />
    </T.Provider>
  ),
};

export const WithoutAction: Story = {
  render: () => (
    <T.Provider>
      <ToastCard
        tone="success"
        title="Settings saved"
        description="Alert thresholds updated for 6 zones."
        open
        duration={Infinity}
      />
      <T.Viewport className="m-0 list-none p-0" />
    </T.Provider>
  ),
};

/** Real queue: success/info are polite (role=status), warning/error assertive. F8 jumps to the region. */
export const Live: Story = {
  parameters: { layout: 'centered' },
  render: function Render() {
    const toast = useToast();
    return (
      <div className="flex flex-wrap gap-8">
        {examples.map((t) => (
          <Button key={t.tone} variant="secondary" onClick={() => toast(t)}>
            Show {t.tone}
          </Button>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Show success' }));
    const body = within(canvasElement.ownerDocument.body);
    await expect(await body.findByText('Settings saved')).toBeVisible();
  },
};
