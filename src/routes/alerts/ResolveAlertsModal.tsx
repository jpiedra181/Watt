import { useState } from 'react';
import { CircleAlert, TriangleAlert } from 'lucide-react';
import type { Alert } from '@/api/schemas';
import { Button } from '@/components/ui/Button/Button';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { Modal, ModalClose, ModalContent } from '@/components/ui/Modal/Modal';
import { alertTime } from '@/lib/dates';

/** Figma "Alerts · Resolve modal" (27:4467) — Modal `Type=Confirm`, Default and Loading. */
export function ResolveAlertsModal({
  open,
  onOpenChange,
  alerts,
  now,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  alerts: Alert[];
  now?: string;
  pending: boolean;
  onConfirm: (notifyMaintenance: boolean) => void;
}) {
  const [notify, setNotify] = useState(true);
  const n = alerts.length;
  // Critical first, then oldest first — the order a technician would work through them.
  const ordered = [...alerts].sort((a, b) =>
    a.severity === b.severity ? a.at.localeCompare(b.at) : a.severity === 'critical' ? -1 : 1,
  );
  return (
    <Modal open={open} onOpenChange={(o) => !pending && onOpenChange(o)}>
      <ModalContent
        title={`Resolve ${n} alert${n === 1 ? '' : 's'}?`}
        description="They’ll be marked as resolved for everyone at El Olivar. You can reopen them later."
        dismissible={!pending}
        footer={
          <>
            <ModalClose asChild>
              <Button variant="secondary" disabled={pending}>
                Cancel
              </Button>
            </ModalClose>
            <Button loading={pending} onClick={() => onConfirm(notify)}>
              Resolve {n} alert{n === 1 ? '' : 's'}
            </Button>
          </>
        }
      >
        <ul className="flex flex-col rounded-md bg-subtle px-12 py-4">
          {ordered.map((a) => {
            const Icon = a.severity === 'critical' ? CircleAlert : TriangleAlert;
            return (
              <li key={a.id} className="flex items-center gap-10 py-8">
                <Icon
                  size={16}
                  aria-hidden="true"
                  className={a.severity === 'critical' ? 'shrink-0 text-critical' : 'shrink-0 text-warning'}
                />
                <span className="sr-only">{a.severity === 'critical' ? 'Critical:' : 'Warning:'}</span>
                <span className="min-w-0 flex-1 type-body-small-strong text-primary">{a.title}</span>
                <span className="type-caption whitespace-nowrap text-tertiary">
                  {a.meta.split(' · ')[0]} · {now ? alertTime(a.at, now) : ''}
                </span>
              </li>
            );
          })}
        </ul>
        <Checkbox label="Notify the maintenance team" checked={notify} onCheckedChange={setNotify} />
      </ModalContent>
    </Modal>
  );
}
