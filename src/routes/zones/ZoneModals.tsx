import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ZoneRow } from '@/api/schemas';
import { ZoneType } from '@/api/schemas';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal, ModalClose, ModalContent } from '@/components/ui/Modal/Modal';
import { Select } from '@/components/ui/Select/Select';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { useToast } from '@/components/ui/Toast/Toast';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { formatEuro, formatKwh, formatPercent, formatShare } from '@/lib/format';
import { zoneTypeName } from '@/lib/zones';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const zoneForm = z.object({
  name: z.string().trim().min(2, 'Give the zone a name of at least 2 characters.'),
  type: ZoneType,
  meter: z.string().min(1, 'Choose the meter that feeds this zone.'),
  threshold: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Enter a number of kWh per day — use a dot for decimals.')
    .refine((v) => Number(v) > 0 && Number(v) <= 2000, 'Enter a value between 1 and 2,000 kWh per day.'),
  report: z.boolean(),
});
type ZoneForm = z.infer<typeof zoneForm>;

/** "Add zone" — Figma Modal `Type=Form`. The demo validates and confirms; zones are not persisted. */
export function ZoneFormModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const toast = useToast();
  const { register, control, handleSubmit, reset, formState } = useForm<ZoneForm>({
    resolver: zodResolver(zoneForm),
    mode: 'onTouched',
    defaultValues: { name: '', type: 'pool', meter: '', threshold: '120', report: true },
  });
  useEffect(() => {
    if (open) reset();
  }, [open, reset]);

  const submit = handleSubmit(async (v) => {
    await wait(900);
    onOpenChange(false);
    toast({
      tone: 'success',
      title: 'Zone created',
      description: `${v.name} · ${zoneTypeName[v.type]} — readings appear within 15 minutes.`,
    });
  });

  const busy = formState.isSubmitting;
  return (
    <Modal open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <ModalContent
        title="Add zone"
        description="Group one or more meters to track them together."
        dismissible={!busy}
        initialFocus="first"
        footer={
          <>
            <ModalClose asChild>
              <Button variant="secondary" disabled={busy}>
                Cancel
              </Button>
            </ModalClose>
            <Button type="submit" form="zone-form" loading={busy}>
              Save zone
            </Button>
          </>
        }
      >
        <form id="zone-form" noValidate onSubmit={submit} className="flex flex-col gap-16">
          <Input
            label="Zone name"
            placeholder="e.g. Spa"
            error={formState.errors.name?.message}
            {...register('name')}
          />
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                label="Zone type"
                value={field.value}
                onValueChange={field.onChange}
                options={ZoneType.options.map((t) => ({ value: t, label: zoneTypeName[t] }))}
              />
            )}
          />
          <Controller
            control={control}
            name="meter"
            render={({ field, fieldState }) => (
              <Select
                label="Meter"
                placeholder="Select a meter"
                value={field.value || undefined}
                onValueChange={field.onChange}
                error={fieldState.error?.message}
                options={[
                  { value: 'P-03', label: 'P-03 · Spare channel 1' },
                  { value: 'A-03', label: 'A-03 · Spare channel 2' },
                  { value: 'new', label: 'Pair a new meter…' },
                ]}
              />
            )}
          />
          <Input
            label="Attention threshold (kWh / day)"
            inputMode="decimal"
            helper="Typical for this season: 96 kWh / day"
            error={formState.errors.threshold?.message}
            {...register('threshold')}
          />
          <Controller
            control={control}
            name="report"
            render={({ field }) => (
              <Toggle
                label="Include in monthly report"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </form>
      </ModalContent>
    </Modal>
  );
}

/** "Set thresholds" for one or more zones. State lives in the dialog body, so it resets on every open. */
export function ThresholdModal({
  open,
  onOpenChange,
  rows,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  rows: ZoneRow[];
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {open && <ThresholdDialog rows={rows} onDone={() => onOpenChange(false)} />}
    </Modal>
  );
}

function ThresholdDialog({ rows, onDone }: { rows: ZoneRow[]; onDone: () => void }) {
  const toast = useToast();
  const [value, setValue] = useState('10');
  const [busy, setBusy] = useState(false);
  const [touched, setTouched] = useState(false);
  const valid = /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 100;
  const names = rows.map((r) => r.name);

  return (
    <ModalContent
      title={rows.length === 1 ? `Set threshold · ${names[0]}` : `Set thresholds for ${rows.length} zones`}
      description="Watt raises Attention when a zone runs this much above its baseline for the same hour and season."
      dismissible={!busy}
      initialFocus="first"
      footer={
        <>
          <ModalClose asChild>
            <Button variant="secondary" disabled={busy}>
              Cancel
            </Button>
          </ModalClose>
          <Button
            loading={busy}
            onClick={async () => {
              setTouched(true);
              if (!valid) return;
              setBusy(true);
              await wait(800);
              onDone();
              toast({
                tone: 'success',
                title: 'Thresholds updated',
                description: `Attention at +${value}% for ${rows.length === 1 ? names[0] : `${rows.length} zones`}.`,
              });
            }}
          >
            Save thresholds
          </Button>
        </>
      }
    >
      {rows.length > 1 && <p className="type-body-small text-secondary">{names.join(' · ')}</p>}
      <Input
        label="Attention threshold (% over baseline)"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => setTouched(true)}
        helper="Default 10%. Lower values create more alerts."
        error={touched && !valid ? 'Enter a whole number between 1 and 100.' : undefined}
      />
    </ModalContent>
  );
}

/** "Compare" the selected zones side by side. */
export function CompareModal({
  open,
  onOpenChange,
  load,
  previousMonth,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  load: () => Promise<ZoneRow[]>;
  previousMonth: string;
}) {
  const { data: rows } = useQuery({
    queryKey: ['compare', open],
    queryFn: load,
    enabled: open,
    gcTime: 0,
    staleTime: 0,
  });

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title="Compare zones"
        description={`This month against ${previousMonth}.`}
        className="w-[640px]"
        footer={
          <ModalClose asChild>
            <Button variant="secondary">Close</Button>
          </ModalClose>
        }
      >
        <div className="overflow-x-auto rounded-md border border-default" aria-busy={!rows || undefined}>
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Selected zones compared</caption>
            <thead className="bg-subtle">
              <tr>
                {['Zone', 'kWh', `vs ${previousMonth}`, 'Cost', 'Share'].map((h, i) => (
                  <th
                    key={h}
                    scope="col"
                    className={`h-36 border-b border-default px-12 type-caption-strong text-secondary ${i ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!rows
                ? [0, 1].map((i) => (
                    <tr key={i}>
                      <td colSpan={5} className="h-40 px-12">
                        <Skeleton width="100%" height={10} />
                      </td>
                    </tr>
                  ))
                : rows.map((r) => {
                    const change = (r.kwh - r.previousKwh) / r.previousKwh;
                    return (
                      <tr key={r.id} className="border-b border-subtle last:border-0">
                        <th scope="row" className="h-40 px-12 type-body-small-strong text-primary">
                          {r.name}
                        </th>
                        <td className="px-12 text-right type-data-mono tabular">{formatKwh(r.kwh)}</td>
                        <td
                          className={`px-12 text-right type-data-mono tabular ${change > 0.02 ? 'text-critical' : change < -0.02 ? 'text-good' : 'text-secondary'}`}
                        >
                          {change >= 0 ? '+' : '−'}
                          {formatPercent(change)}
                        </td>
                        <td className="px-12 text-right type-data-mono tabular">€ {formatEuro(r.cost)}</td>
                        <td className="px-12 text-right type-data-mono tabular">{formatShare(r.share)}</td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </ModalContent>
    </Modal>
  );
}
