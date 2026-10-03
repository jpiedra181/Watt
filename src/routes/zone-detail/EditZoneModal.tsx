import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import type { ZoneTypeDetail } from '@/api/schemas';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Modal, ModalClose, ModalContent } from '@/components/ui/Modal/Modal';
import { Select } from '@/components/ui/Select/Select';
import { useToast } from '@/components/ui/Toast/Toast';
import { Toggle } from '@/components/ui/Toggle/Toggle';

const schema = z.object({
  name: z.string().trim().min(2, 'Give the zone a name of at least 2 characters.'),
  meter: z.string().min(1),
  threshold: z
    .string()
    .regex(/^\d+(\.\d+)?$/, 'Enter a number of kWh per day — use a dot for decimals.')
    .refine((v) => Number(v) > 0 && Number(v) <= 2000, 'Enter a value between 1 and 2,000 kWh per day.'),
  report: z.boolean(),
});
type Form = z.infer<typeof schema>;

/** Figma Modal `Type=Form` ("Edit zone") — validated with zod; Cancel and Save follow the Loading state. */
export function EditZoneModal({
  open,
  onOpenChange,
  detail,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  detail: ZoneTypeDetail;
}) {
  const toast = useToast();
  const typicalPerDay = Math.round(detail.kwh / 30);
  const defaults: Form = {
    name: detail.name,
    meter: detail.meters[0]?.code ?? '',
    threshold: String(Math.round(typicalPerDay * 1.25)),
    report: true,
  };
  const { register, control, handleSubmit, reset, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: defaults,
  });

  useEffect(() => {
    if (open) reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const busy = formState.isSubmitting;
  const submit = handleSubmit(async (v) => {
    await new Promise((r) => setTimeout(r, 900));
    onOpenChange(false);
    toast({
      tone: 'success',
      title: 'Zone updated',
      description: `${v.name} · attention above ${v.threshold} kWh / day`,
    });
  });

  return (
    <Modal open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <ModalContent
        title="Edit zone"
        description="Changes apply to new readings from now on."
        dismissible={!busy}
        initialFocus="first"
        footer={
          <>
            <ModalClose asChild>
              <Button variant="secondary" disabled={busy}>
                Cancel
              </Button>
            </ModalClose>
            <Button type="submit" form="edit-zone" loading={busy}>
              Save changes
            </Button>
          </>
        }
      >
        <form id="edit-zone" noValidate onSubmit={submit} className="flex flex-col gap-16">
          <Input label="Zone name" error={formState.errors.name?.message} {...register('name')} />
          <Controller
            control={control}
            name="meter"
            render={({ field }) => (
              <Select
                label="Meter"
                value={field.value}
                onValueChange={field.onChange}
                options={detail.meters.map((m) => ({ value: m.code, label: `${m.code} · ${m.name}` }))}
              />
            )}
          />
          <Input
            label="Attention threshold (kWh / day)"
            inputMode="decimal"
            helper={`Typical for this season: ${typicalPerDay} kWh / day`}
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
