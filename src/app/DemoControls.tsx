import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button/Button';
import { Modal, ModalClose, ModalContent } from '@/components/ui/Modal/Modal';
import { RangeSelector } from '@/components/ui/RangeSelector/RangeSelector';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { resetDb } from '@/mocks/db';
import {
  getScenario,
  setScenario,
  subscribeScenario,
  type Failure,
  type Latency,
  type Scenario,
} from '@/mocks/scenario';

const latencies = [
  { value: 'fast', label: 'Fast', description: 'Fast network, about 0.1 s' },
  { value: 'realistic', label: 'Realistic', description: 'Realistic network, 0.3 to 2.5 s' },
  { value: 'slow', label: 'Slow', description: 'Slow network, 1.6 to 3.8 s' },
] as const satisfies readonly { value: Latency; label: string; description: string }[];

const failures = [
  { value: 'none', label: 'None', description: 'No errors' },
  { value: 'random', label: '15% random', description: '15% of requests fail at random' },
  { value: 'all', label: 'All requests', description: 'Every request fails' },
] as const satisfies readonly { value: Failure; label: string; description: string }[];

/**
 * The demo has no backend: MSW answers every request. These controls change how that fake
 * gateway behaves so skeletons, error and empty states can be seen on real screens.
 * Also reachable through the URL: `?demo=slow`, `?demo=errors`, `?demo=empty`.
 */
export function DemoControls({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const qc = useQueryClient();
  const [s, setS] = useState<Scenario>(getScenario);
  useEffect(() => subscribeScenario(setS), []);

  const update = (patch: Partial<Scenario>) => {
    setScenario(patch);
    void qc.resetQueries();
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title="Demo controls"
        description="Watt runs on a mock API in your browser. Change how it behaves to see loading, error and empty states."
        footer={
          <>
            <Button
              variant="ghost"
              leadingIcon={RotateCcw}
              onClick={() => {
                resetDb();
                setScenario({ latency: 'realistic', errors: 'none', empty: false });
                void qc.resetQueries();
              }}
            >
              Reset demo
            </Button>
            <ModalClose asChild>
              <Button>Done</Button>
            </ModalClose>
          </>
        }
      >
        <fieldset className="flex flex-col gap-8">
          <legend className="mb-8 type-body-small-strong text-primary">Network latency</legend>
          <RangeSelector
            label="Network latency"
            options={latencies}
            value={s.latency === 'none' ? 'fast' : s.latency}
            onValueChange={(latency) => update({ latency })}
          />
        </fieldset>
        <fieldset className="flex flex-col gap-8">
          <legend className="mb-8 type-body-small-strong text-primary">Failed requests</legend>
          <RangeSelector
            label="Failed requests"
            options={failures}
            value={s.errors}
            onValueChange={(errors) => update({ errors })}
          />
          <p className="type-caption text-tertiary">
            Failed reads show error states with Retry; failed actions roll back and show a toast.
          </p>
        </fieldset>
        <Toggle
          label="Empty property (no readings yet)"
          checked={s.empty}
          onCheckedChange={(empty) => update({ empty })}
        />
      </ModalContent>
    </Modal>
  );
}

/** `?demo=slow|errors|empty|fast` on any URL applies a scenario before the app starts. */
export function applyDemoParam() {
  const params = new URLSearchParams(window.location.search);
  const demo = params.get('demo');
  if (!demo) return;
  const map: Record<string, Partial<Scenario>> = {
    slow: { latency: 'slow', errors: 'none', empty: false },
    fast: { latency: 'fast', errors: 'none', empty: false },
    errors: { errors: 'all', empty: false },
    flaky: { errors: 'random', empty: false },
    empty: { empty: true, errors: 'none' },
    reset: { latency: 'realistic', errors: 'none', empty: false },
  };
  if (map[demo]) setScenario(map[demo]);
  params.delete('demo');
  const qsStr = params.toString();
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${qsStr ? `?${qsStr}` : ''}${window.location.hash}`,
  );
}
