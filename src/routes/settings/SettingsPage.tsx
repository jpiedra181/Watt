import { useEffect, useState, type ReactNode } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Link, useBlocker } from '@tanstack/react-router';
import { Bell, Building, CalendarClock, CircleAlert, Layers, Plug, RefreshCw, User } from 'lucide-react';
import { Controller, useForm, type Control, type FieldPath } from 'react-hook-form';
import { queries, useSaveSettingsMutation } from '@/api/queries';
import { useDocumentTitle } from '@/app/usePeriod';
import { NavItem } from '@/components/layout/NavItem/NavItem';
import { Page, PageHeader } from '@/components/layout/Page/Page';
import { Avatar } from '@/components/ui/Avatar/Avatar';
import { Button } from '@/components/ui/Button/Button';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge/StatusBadge';
import { tabTriggerClass } from '@/components/ui/Tabs/Tabs';
import { useToast } from '@/components/ui/Toast/Toast';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { cn } from '@/lib/cn';
import { fieldLabels, fromForm, options, settingsForm, toForm, type SettingsForm } from './settingsForm';

const SECTIONS = [
  { id: 'property', label: 'Property', icon: Building },
  { id: 'contract', label: 'Energy contract', icon: Plug },
  { id: 'alerts', label: 'Alerts & notifications', icon: Bell },
  { id: 'team', label: 'Team', icon: User },
  { id: 'integrations', label: 'Integrations', icon: Layers },
] as const;
const SECTION_IDS = SECTIONS.map((s) => s.id);

/** Figma 05 · Settings — Desktop 1440 (29:4644), Tablet 1024 (29:5062). */
export function SettingsPage() {
  useDocumentTitle('Settings');
  const query = useQuery(queries.settings());
  const property = useQuery(queries.property());

  return (
    <Page>
      <PageHeader
        title="Settings"
        subtitle={`${property.data?.name ?? 'Casa Rural El Olivar'} · changes apply to everyone on your team`}
      />
      {query.isError ? (
        <div className="rounded-lg border border-default bg-surface">
          <EmptyState
            variant="error"
            title="Couldn’t load settings"
            description="Your settings are safe — try again in a moment."
            action={
              <Button variant="secondary" leadingIcon={RefreshCw} onClick={() => void query.refetch()}>
                Retry
              </Button>
            }
          />
        </div>
      ) : query.data ? (
        <SettingsFormView initial={toForm(query.data)} />
      ) : (
        <div
          className="grid gap-32 xl:grid-cols-[216px_minmax(0,1fr)]"
          aria-busy="true"
          aria-label="Loading settings"
        >
          <div className="flex flex-col gap-8 max-xl:hidden">
            {SECTIONS.map((s) => (
              <Skeleton key={s.id} width={160} height={12} className="my-12 ml-10" />
            ))}
          </div>
          <div className="flex flex-col gap-20">
            {[256, 380, 460].map((h) => (
              <Skeleton key={h} shape="block" width="100%" height={h} className="rounded-lg" />
            ))}
          </div>
        </div>
      )}
    </Page>
  );
}

export function SettingsFormView({ initial }: { initial: SettingsForm }) {
  const toast = useToast();
  const save = useSaveSettingsMutation();
  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsForm),
    mode: 'onTouched',
    defaultValues: initial,
  });
  const { control, register, handleSubmit, reset, setFocus, formState } = form;
  const { errors, isDirty } = formState;
  const active = useScrollSpy(SECTION_IDS);

  useBlocker({
    shouldBlockFn: () => isDirty && !window.confirm('You have unsaved changes. Leave without saving?'),
    enableBeforeUnload: () => isDirty,
  });

  const invalid = (Object.keys(errors) as (keyof SettingsForm)[]).filter((k) => errors[k]);
  const submit = handleSubmit((values) =>
    save.mutate(fromForm(values), {
      onSuccess: (saved) => {
        reset(toForm(saved));
        toast({
          tone: 'success',
          title: 'Settings saved',
          description: 'Changes apply to new readings and alerts from now on.',
        });
      },
      onError: () =>
        toast({
          tone: 'error',
          title: 'Couldn’t save settings',
          description: 'Nothing changed. Try again in a moment.',
        }),
    }),
  );

  return (
    <div className="grid items-start gap-20 xl:grid-cols-[216px_minmax(0,1fr)] xl:gap-32">
      <nav aria-label="Settings sections" className="sticky top-96 flex flex-col gap-2 max-xl:hidden">
        {SECTIONS.map((s) => (
          <NavItem
            key={s.id}
            to="/settings"
            hash={s.id}
            icon={s.icon}
            label={s.label}
            active={active === s.id}
          />
        ))}
      </nav>
      {/* Figma tablet: the section list becomes underline tabs above the form. */}
      <nav aria-label="Jump to section" className="-mx-16 overflow-x-auto px-16 md:mx-0 md:px-0 xl:hidden">
        <ul className="flex min-w-max border-b border-default">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link
                to="/settings"
                hash={s.id}
                activeOptions={{ exact: true, includeHash: true }}
                data-active={active === s.id || undefined}
                aria-current={active === s.id ? 'location' : undefined}
                className={cn(
                  tabTriggerClass.underline,
                  'data-[active]:border-brand data-[active]:text-primary',
                )}
              >
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <form
        noValidate
        onSubmit={submit}
        className="flex min-w-0 flex-col gap-20"
        aria-label="Property settings"
      >
        <Section
          id="property"
          title="Property"
          description="Used in reports and to compare consumption with similar properties."
        >
          <Row>
            <Input label="Property name" error={errors.name?.message} {...register('name')} />
            <SelectField control={control} name="type" label="Property type" options={options.type} />
          </Row>
          <Row>
            <SelectField control={control} name="timezone" label="Time zone" options={options.timezone} />
            <SelectField control={control} name="currency" label="Currency" options={options.currency} />
          </Row>
        </Section>

        <Section
          id="contract"
          title="Energy contract"
          description="Contracted power defines when Watt raises attention (≥ 80%) and alert (over contract) states."
        >
          <Row>
            <SelectField control={control} name="supplier" label="Supplier" options={options.supplier} />
            <SelectField control={control} name="tariff" label="Tariff" options={options.tariff} />
          </Row>
          <Row>
            <Input
              label="Contracted power (kW)"
              inputMode="decimal"
              error={errors.contractedKw?.message}
              {...register('contractedKw')}
            />
            <Input
              label="Average price per kWh (€)"
              inputMode="decimal"
              helper="Mean of your 3 periods, VAT included."
              error={errors.pricePerKwh?.message}
              {...register('pricePerKwh')}
            />
          </Row>
          <Row>
            <Input
              label="Billing day"
              inputMode="numeric"
              placeholder="Day of the month (1–28)"
              helper="We split monthly reports on this day."
              error={errors.billingDay?.message}
              {...register('billingDay')}
            />
            <SelectField
              control={control}
              name="gateway"
              label="Meter gateway"
              placeholder="Select a gateway"
              options={options.gateway}
            />
          </Row>
        </Section>

        <Section
          id="alerts"
          title="Alerts & notifications"
          description="Thresholds are compared with each zone’s baseline for the same hour and season."
        >
          <Row>
            <Input
              label="Attention threshold (% over baseline)"
              inputMode="numeric"
              helper="Default 10%. Lower values create more alerts."
              error={errors.attentionPct?.message}
              {...register('attentionPct')}
            />
            <Input
              label="Alert threshold (% over baseline)"
              inputMode="numeric"
              helper="Always creates an alert and a push notification."
              error={errors.alertPct?.message}
              {...register('alertPct')}
            />
          </Row>
          <fieldset className="flex flex-col gap-12">
            <legend className="sr-only">Notifications</legend>
            <ToggleField control={control} name="dailySummary" label="Daily summary email at 08:00" />
            <ToggleField
              control={control}
              name="pushPeaks"
              label="Push notification on peaks and meter outages"
            />
            <ToggleField control={control} name="weeklySavings" label="Weekly savings report (Mondays)" />
            <ToggleField
              control={control}
              name="autoApply"
              label="Auto-apply low-risk recommendations"
              hint="· Pro plan"
              disabled
            />
          </fieldset>
          <Controller
            control={control}
            name="notify"
            render={({ field }) => (
              <fieldset className="flex flex-col gap-10 pt-4">
                <legend className="mb-10 type-body-small-strong text-primary">Notify</legend>
                {options.notify.map((o) => (
                  <Checkbox
                    key={o.value}
                    label={o.label}
                    checked={field.value.includes(o.value)}
                    onCheckedChange={(on) =>
                      field.onChange(
                        on ? [...field.value, o.value] : field.value.filter((v) => v !== o.value),
                      )
                    }
                  />
                ))}
              </fieldset>
            )}
          />
        </Section>

        <Section
          id="team"
          title="Team"
          description="People who can see this property. Managers can change settings."
        >
          <ul className="flex flex-col divide-y divide-subtle">
            {[
              { initials: 'LM', name: 'Lucía Martín', email: 'lucia@elolivar.es', role: 'Manager' },
              { initials: 'PR', name: 'Pablo Ruiz', email: 'mantenimiento@elolivar.es', role: 'Maintenance' },
              { initials: 'FD', name: 'Front desk', email: 'recepcion@elolivar.es', role: 'Viewer' },
            ].map((m) => (
              <li key={m.email} className="flex items-center gap-12 py-12 first:pt-0 last:pb-0">
                <Avatar initials={m.initials} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate type-body-small-strong text-primary">{m.name}</p>
                  <p className="truncate type-caption text-tertiary">{m.email}</p>
                </div>
                <StatusBadge tone={m.role === 'Manager' ? 'brand' : 'neutral'} showDot={false}>
                  {m.role}
                </StatusBadge>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          id="integrations"
          title="Integrations"
          description="Where Watt reads meters, bookings and prices from."
        >
          <ul className="flex flex-col divide-y divide-subtle">
            {[
              { icon: Plug, name: 'Meter gateway', detail: '24 meters · last sync 1 min ago', on: true },
              {
                icon: CalendarClock,
                name: 'Booking system',
                detail: 'Guest nights for the per-guest KPI',
                on: true,
              },
              {
                icon: Building,
                name: 'Supplier portal',
                detail: 'Download invoices automatically',
                on: false,
              },
            ].map((i) => (
              <li key={i.name} className="flex items-center gap-12 py-12 first:pt-0 last:pb-0">
                <span
                  aria-hidden="true"
                  className="flex size-32 shrink-0 items-center justify-center rounded-md bg-subtle text-icon-secondary"
                >
                  <i.icon size={16} />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate type-body-small-strong text-primary">{i.name}</p>
                  <p className="truncate type-caption text-tertiary">{i.detail}</p>
                </div>
                <Toggle label={`${i.name} connected`} hideLabel defaultChecked={i.on} />
              </li>
            ))}
          </ul>
        </Section>

        {(isDirty || invalid.length > 0) && (
          <div
            role="region"
            aria-label="Save changes"
            className="sticky bottom-16 z-20 flex flex-wrap items-center gap-12 rounded-lg border border-default bg-surface-raised py-12 pl-16 pr-12 shadow-elevation-2"
          >
            {invalid.length > 0 ? (
              <p
                className="flex min-w-0 flex-1 items-center gap-8 type-body-small-strong text-primary"
                role="alert"
              >
                <CircleAlert size={16} aria-hidden="true" className="shrink-0 text-critical" />
                <span>
                  {invalid.length} field{invalid.length === 1 ? ' needs' : 's need'} attention ·{' '}
                  {invalid.map((k, i) => (
                    <span key={k}>
                      {i > 0 && ', '}
                      <button
                        type="button"
                        className="rounded-xs underline-offset-2 outline-none hover:underline focus-visible:shadow-focus-ring"
                        onClick={() => setFocus(k)}
                      >
                        {fieldLabels[k] ?? k}
                      </button>
                    </span>
                  ))}
                </span>
              </p>
            ) : (
              <p className="min-w-0 flex-1 type-body-small-strong text-primary">You have unsaved changes</p>
            )}
            <Button variant="secondary" onClick={() => reset(initial)} disabled={save.isPending}>
              Discard
            </Button>
            <Button type="submit" loading={save.isPending}>
              Save changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-80 flex-col gap-20 rounded-lg border border-default bg-surface p-16 md:p-24"
    >
      <header className="flex flex-col gap-4">
        <h2 id={`${id}-title`} className="type-heading-section text-primary">
          {title}
        </h2>
        <p className="type-body-small text-secondary">{description}</p>
      </header>
      {children}
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="grid items-start gap-16 md:grid-cols-2">{children}</div>;
}

function SelectField({
  control,
  name,
  label,
  options: opts,
  placeholder,
}: {
  control: Control<SettingsForm>;
  name: FieldPath<SettingsForm>;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Select
          label={label}
          placeholder={placeholder}
          options={opts}
          value={(field.value as string) || undefined}
          onValueChange={field.onChange}
        />
      )}
    />
  );
}

function ToggleField({
  control,
  name,
  label,
  hint,
  disabled,
}: {
  control: Control<SettingsForm>;
  name: 'dailySummary' | 'pushPeaks' | 'weeklySavings' | 'autoApply';
  label: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Toggle
          label={label}
          hint={hint}
          disabled={disabled}
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      )}
    />
  );
}

/** Which section is under the sticky header — drives the active item in the settings nav. */
function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
        const best =
          ids.find((id) => (visible.get(id) ?? 0) > 0.25) ?? ids.find((id) => (visible.get(id) ?? 0) > 0);
        if (best) setActive(best);
      },
      { rootMargin: '-96px 0px -40% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [ids]);
  return active;
}
