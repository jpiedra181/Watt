import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { figma, pseudoStates, StateGrid, withFrame } from '@/stories/helpers';
import { PageButton, Pagination } from './Pagination';

const meta = {
  title: 'Components/Navigation/Pagination',
  component: Pagination,
  parameters: { ...figma('14:792'), layout: 'padded' },
  args: {
    page: 1,
    pageSize: 10,
    total: 48,
    itemLabel: 'zones',
    onPageChange: () => {},
    onPageSizeChange: () => {},
  },
  decorators: [withFrame('max-w-[1136px] overflow-hidden rounded-lg border border-default')],
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Figma `Position=First`. */
export const First: Story = {};
/** Figma `Position=Middle`. */
export const Middle: Story = { args: { page: 3 } };
/** Figma `Position=Last`. */
export const Last: Story = { args: { page: 5 } };

export const Interactive: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    return (
      <Pagination {...args} page={page} pageSize={size} onPageChange={setPage} onPageSizeChange={setSize} />
    );
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await expect(canvas.getByText('Showing 11–20 of 48 zones')).toBeVisible();
  },
};

/** Figma `Page Button` (14:686) states. */
export const PageButtonStates: Story = {
  name: 'Page Button · all states',
  parameters: { ...figma('14:686'), ...pseudoStates('button'), fullWidth: true },
  render: () => (
    <StateGrid
      cellWidth={40}
      columns={['Default', 'Hover', 'Focus', 'Selected', 'Disabled']}
      rows={[
        {
          cells: ['Default', 'Hover', 'Focus', 'Selected', 'Disabled'].map((s) => (
            <PageButton key={s} selected={s === 'Selected'} disabled={s === 'Disabled'}>
              1
            </PageButton>
          )),
        },
      ]}
    />
  ),
};
