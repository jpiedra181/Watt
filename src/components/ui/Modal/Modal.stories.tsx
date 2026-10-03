import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { CircleAlert, TriangleAlert } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import { figma } from '@/stories/helpers';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { Input } from '../Input/Input';
import { Select } from '../Select/Select';
import { Toggle } from '../Toggle/Toggle';
import { Modal, ModalClose, ModalContent, ModalTrigger } from './Modal';

const meta = {
  title: 'Components/Overlays/Modal',
  component: Modal,
  parameters: { ...figma('20:919') },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const alerts = [
  { icon: CircleAlert, tone: 'text-critical', title: 'Peak over contracted power', meta: 'Pool · 19:42' },
  {
    icon: TriangleAlert,
    tone: 'text-warning',
    title: 'Night consumption above baseline',
    meta: 'Kitchen · 03:10',
  },
  {
    icon: TriangleAlert,
    tone: 'text-warning',
    title: 'Heat pump running in empty rooms',
    meta: 'Rooms 104–106 · 11:25',
  },
];

function ConfirmBody() {
  return (
    <>
      <ul className="flex flex-col rounded-md bg-subtle px-12 py-4">
        {alerts.map(({ icon: Icon, tone, title, meta }) => (
          <li key={title} className="flex items-center gap-10 py-8">
            <Icon size={16} aria-hidden="true" className={tone} />
            <span className="min-w-0 flex-1 type-body-small-strong text-primary">{title}</span>
            <span className="type-caption text-tertiary">{meta}</span>
          </li>
        ))}
      </ul>
      <Checkbox label="Notify the maintenance team" defaultChecked />
    </>
  );
}

function ConfirmDemo({ loading = false, open }: { loading?: boolean; open?: boolean }) {
  return (
    <Modal defaultOpen={open}>
      <ModalTrigger asChild>
        <Button>Resolve new (3)</Button>
      </ModalTrigger>
      <ModalContent
        title="Resolve 3 alerts?"
        description="They’ll be marked as resolved for everyone at El Olivar. You can reopen them later."
        dismissible={!loading}
        footer={
          <>
            <ModalClose asChild>
              <Button variant="secondary" disabled={loading}>
                Cancel
              </Button>
            </ModalClose>
            <Button loading={loading}>Resolve 3 alerts</Button>
          </>
        }
      >
        <ConfirmBody />
      </ModalContent>
    </Modal>
  );
}

/** Focus moves into the dialog, Tab is trapped, Esc closes and focus returns to the trigger. */
export const Confirm: Story = {
  render: () => <ConfirmDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Resolve new (3)' });
    await userEvent.click(trigger);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', { name: 'Resolve 3 alerts?' });
    await expect(dialog).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect(trigger).toHaveFocus();
  },
};

export const ConfirmOpen: Story = { name: 'Confirm · open', render: () => <ConfirmDemo open /> };
export const ConfirmLoading: Story = {
  name: 'Confirm · loading',
  render: () => <ConfirmDemo open loading />,
};

function Form({ loading = false }: { loading?: boolean }) {
  const [meter, setMeter] = useState('p01');
  return (
    <Modal defaultOpen>
      <ModalTrigger asChild>
        <Button variant="secondary">Edit zone</Button>
      </ModalTrigger>
      <ModalContent
        title="Edit zone"
        description="Changes apply to new readings from now on."
        dismissible={!loading}
        footer={
          <>
            <ModalClose asChild>
              <Button variant="secondary" disabled={loading}>
                Cancel
              </Button>
            </ModalClose>
            <Button loading={loading}>Save changes</Button>
          </>
        }
      >
        <Input label="Zone name" defaultValue="Pool" />
        <Select
          label="Meter"
          value={meter}
          onValueChange={setMeter}
          options={[
            { value: 'p01', label: 'P-01 · Heat pump' },
            { value: 'p02', label: 'P-02 · Filtration' },
          ]}
        />
        <Input
          label="Attention threshold (kWh / day)"
          defaultValue="120"
          helper="Typical for this season: 96 kWh / day"
        />
        <Toggle label="Include in monthly report" defaultChecked />
      </ModalContent>
    </Modal>
  );
}

export const FormOpen: Story = { name: 'Form · open', render: () => <Form /> };
export const FormLoading: Story = { name: 'Form · loading', render: () => <Form loading /> };
