import type { Meta, StoryObj } from '@storybook/react-vite';
import { figma, StateGrid } from '@/stories/helpers';
import { StatusBadge } from './StatusBadge';

const meta = {
  title: 'Components/Data display/Status Badge',
  component: StatusBadge,
  parameters: { ...figma('7:87') },
  args: { tone: 'good', children: 'Normal' },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The two vocabularies that reuse the five tones. Text always carries the meaning, not just colour. */
export const AllTones: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <StateGrid
      cellWidth={96}
      columns={['Good', 'Warning', 'Critical', 'Brand', 'Neutral']}
      rows={[
        {
          label: 'Consumption state',
          cells: [
            <StatusBadge key="g" tone="good">
              Normal
            </StatusBadge>,
            <StatusBadge key="w" tone="warning">
              Attention
            </StatusBadge>,
            <StatusBadge key="c" tone="critical">
              Alert
            </StatusBadge>,
            <span key="b" />,
            <span key="n" />,
          ],
        },
        {
          label: 'Alert workflow',
          cells: [
            <StatusBadge key="g" tone="good">
              Resolved
            </StatusBadge>,
            <span key="w" />,
            <span key="c" />,
            <StatusBadge key="b" tone="brand">
              New
            </StatusBadge>,
            <StatusBadge key="n" tone="neutral">
              Reviewed
            </StatusBadge>,
          ],
        },
        {
          label: 'Without dot',
          cells: (['good', 'warning', 'critical', 'brand', 'neutral'] as const).map((t) => (
            <StatusBadge key={t} tone={t} showDot={false}>
              Status
            </StatusBadge>
          )),
        },
      ]}
    />
  ),
};
