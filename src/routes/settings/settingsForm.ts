import { z } from 'zod';
import type { Settings } from '@/api/schemas';

const decimal = /^\d+(\.\d+)?$/;
const whole = /^\d+$/;

/** Form model: inputs hold strings so the user's text (e.g. "4,5") survives until it's fixed. */
export const settingsForm = z
  .object({
    name: z.string().trim().min(2, 'Enter the property name.'),
    type: z.string(),
    timezone: z.string(),
    currency: z.string(),
    supplier: z.string(),
    tariff: z.string(),
    contractedKw: z
      .string()
      .trim()
      .refine(
        (v) => decimal.test(v) && Number(v) >= 10 && Number(v) <= 100,
        'Enter a value between 10 and 100 kW — use a dot for decimals.',
      ),
    pricePerKwh: z
      .string()
      .trim()
      .refine(
        (v) => decimal.test(v) && Number(v) >= 0.05 && Number(v) <= 1,
        'Enter a price between 0.05 and 1 € — use a dot for decimals.',
      ),
    billingDay: z
      .string()
      .trim()
      .refine(
        (v) => v === '' || (whole.test(v) && Number(v) >= 1 && Number(v) <= 28),
        'Enter a day between 1 and 28.',
      ),
    gateway: z.string(),
    attentionPct: z
      .string()
      .trim()
      .refine(
        (v) => whole.test(v) && Number(v) >= 1 && Number(v) <= 100,
        'Enter a whole number between 1 and 100.',
      ),
    alertPct: z
      .string()
      .trim()
      .refine(
        (v) => whole.test(v) && Number(v) >= 1 && Number(v) <= 200,
        'Enter a whole number between 1 and 200.',
      ),
    dailySummary: z.boolean(),
    pushPeaks: z.boolean(),
    weeklySavings: z.boolean(),
    autoApply: z.boolean(),
    notify: z.array(z.string()),
  })
  .refine(
    (v) =>
      !whole.test(v.alertPct) || !whole.test(v.attentionPct) || Number(v.alertPct) > Number(v.attentionPct),
    {
      path: ['alertPct'],
      message: 'The alert threshold has to be higher than the attention threshold.',
    },
  );

export type SettingsForm = z.infer<typeof settingsForm>;

export const fieldLabels: Partial<Record<keyof SettingsForm, string>> = {
  name: 'Property name',
  contractedKw: 'Contracted power',
  pricePerKwh: 'Average price per kWh',
  billingDay: 'Billing day',
  attentionPct: 'Attention threshold',
  alertPct: 'Alert threshold',
};

export const toForm = (s: Settings): SettingsForm => ({
  name: s.property.name,
  type: s.property.type,
  timezone: s.property.timezone,
  currency: s.property.currency,
  supplier: s.contract.supplier,
  tariff: s.contract.tariff,
  contractedKw: String(s.contract.contractedKw),
  pricePerKwh: String(s.contract.pricePerKwh),
  billingDay: s.contract.billingDay == null ? '' : String(s.contract.billingDay),
  gateway: s.contract.gateway ?? '',
  attentionPct: String(s.alerts.attentionPct),
  alertPct: String(s.alerts.alertPct),
  dailySummary: s.alerts.dailySummary,
  pushPeaks: s.alerts.pushPeaks,
  weeklySavings: s.alerts.weeklySavings,
  autoApply: s.alerts.autoApply,
  notify: s.alerts.notify,
});

export const fromForm = (f: SettingsForm): Settings => ({
  property: { name: f.name.trim(), type: f.type, timezone: f.timezone, currency: f.currency },
  contract: {
    supplier: f.supplier,
    tariff: f.tariff,
    contractedKw: Number(f.contractedKw),
    pricePerKwh: Number(f.pricePerKwh),
    billingDay: f.billingDay ? Number(f.billingDay) : null,
    gateway: f.gateway || null,
  },
  alerts: {
    attentionPct: Number(f.attentionPct),
    alertPct: Number(f.alertPct),
    dailySummary: f.dailySummary,
    pushPeaks: f.pushPeaks,
    weeklySavings: f.weeklySavings,
    autoApply: f.autoApply,
    notify: f.notify,
  },
});

export const options = {
  type: [
    { value: 'rural-14', label: 'Rural house · 14 rooms' },
    { value: 'hotel-30', label: 'Small hotel · up to 30 rooms' },
    { value: 'apartments', label: 'Holiday apartments' },
  ],
  timezone: [
    { value: 'Europe/Madrid', label: 'Europe/Madrid (CET/CEST)' },
    { value: 'Atlantic/Canary', label: 'Atlantic/Canary (WET/WEST)' },
    { value: 'Europe/Lisbon', label: 'Europe/Lisbon (WET/WEST)' },
  ],
  currency: [{ value: 'EUR', label: 'Euro (€)' }],
  supplier: [
    { value: 'solaria', label: 'Solaria Energía' },
    { value: 'iberica', label: 'Ibérica Luz' },
    { value: 'verde', label: 'Verde Cooperativa' },
  ],
  tariff: [
    { value: '2.0TD', label: '2.0TD · 3 periods' },
    { value: '3.0TD', label: '3.0TD · 6 periods' },
  ],
  gateway: [
    { value: 'wg-1', label: 'Watt Gateway W-1 · Reception' },
    { value: 'wg-2', label: 'Watt Gateway W-2 · Plant room' },
  ],
  notify: [
    { value: 'lucia', label: 'Lucía Martín · Manager' },
    { value: 'pablo', label: 'Pablo Ruiz · Maintenance' },
    { value: 'frontdesk', label: 'Front desk (shared inbox)' },
  ],
};
