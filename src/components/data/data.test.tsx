import { screen, within } from '@testing-library/react';
import { Zap } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { hourly } from '@/mocks/db';
import { renderUi } from '@/test/render';
import { HourlyConsumptionChart } from '../charts/HourlyConsumptionChart/HourlyConsumptionChart';
import { KpiCard } from './KpiCard/KpiCard';

describe('KpiCard', () => {
  const base = { label: 'Total consumption', icon: Zap, value: '4,812', unit: 'kWh' };

  it('announces loading without showing stale numbers', async () => {
    renderUi(<KpiCard {...base} status="loading" />);
    const card = await screen.findByRole('article', { name: 'Loading Total consumption' });
    expect(card).toHaveAttribute('aria-busy', 'true');
    expect(within(card).queryByText('4,812')).not.toBeInTheDocument();
  });

  it('shows an announced error with a working Retry', async () => {
    const onRetry = vi.fn();
    const { user } = renderUi(
      <KpiCard {...base} status="error" onRetry={onRetry} errorDetail="Meter offline since 14:20" />,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Couldn’t load data');
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('spells out the direction of the change', async () => {
    renderUi(
      <KpiCard
        {...base}
        delta={{ value: '6.1%', direction: 'down', sentiment: 'positive' }}
        comparison="vs August"
      />,
    );
    expect(await screen.findByText(/down/)).toBeInTheDocument();
  });
});

describe('HourlyConsumptionChart', () => {
  const today = hourly('2026-09-30')!;

  it('describes the chart in words, including the over-contract hour', async () => {
    renderUi(
      <HourlyConsumptionChart
        data={today.points}
        contractedKw={45}
        typicalLabel="Typical Tuesday"
        dayLabel="Tue 30 Sep"
      />,
    );
    const img = await screen.findByRole('img');
    expect(img).toHaveAccessibleName(/Peak of 52\.4 kWh at 19:00/);
    expect(img).toHaveAccessibleName(/1 hour over the 45 kW contract \(19:00\)/);
  });

  it('offers every value as a table from the keyboard', async () => {
    const { user } = renderUi(
      <HourlyConsumptionChart
        data={today.points}
        contractedKw={45}
        typicalLabel="Typical Tuesday"
        dayLabel="Tue 30 Sep"
      />,
    );
    await screen.findByRole('img');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Show data table' })).toHaveFocus();
    await user.keyboard('{Enter}');
    const table = screen.getByRole('table', { name: 'Hourly consumption, Tue 30 Sep' });
    expect(within(table).getAllByRole('row')).toHaveLength(25);
    expect(
      within(table).getByRole('row', { name: /19:00–20:00 52\.4 38\.1 Over contract/ }),
    ).toBeInTheDocument();
  });
});
