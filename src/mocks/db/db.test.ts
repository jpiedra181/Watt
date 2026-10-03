import { describe, expect, it } from 'vitest';
import { alerts, history, hourly, overview, zones, zoneType } from './index';

/** The mock dataset has to reproduce the numbers designed in Figma for September 2026. */
describe('mock dataset matches the Figma screens', () => {
  const sep = overview('2026-09');
  const change = (m: { value: number; previous: number }) =>
    +(((m.value - m.previous) / m.previous) * 100).toFixed(1);

  it('Overview KPIs', () => {
    expect(sep.kpis.consumption.value).toBe(4812);
    expect(change(sep.kpis.consumption)).toBe(-6.1);
    expect(change(sep.kpis.cost)).toBe(-4.3);
    expect(sep.kpis.peakDemand.value).toBe(52.4);
    expect(change(sep.kpis.peakDemand)).toBe(9.8);
    expect(sep.kpis.perGuestNight.value.toFixed(1)).toBe('9.4');
    expect(change(sep.kpis.perGuestNight)).toBe(3.2);
  });

  it('By zone breakdown', () => {
    expect(sep.byType.map((t) => [t.name, t.kwh, Math.round(t.share * 100)])).toEqual([
      ['Climate (HVAC)', 1642, 34],
      ['Pool', 1155, 24],
      ['Rooms', 1010, 21],
      ['Kitchen', 674, 14],
      ['Common areas', 331, 7],
    ]);
  });

  it('Zones table, first page sorted by consumption', () => {
    const page = zones({ period: '2026-09' });
    expect(page.total).toBe(11);
    expect(page.summary).toEqual({ zones: 11, meters: 24 });
    const row = page.items.map((r) => [
      r.name,
      r.kwh,
      +(((r.kwh - r.previousKwh) / r.previousKwh) * 100).toFixed(1),
      r.cost,
      Math.round(r.share * 100),
    ]);
    expect(row.slice(0, 4)).toEqual([
      ['Climate · Main building', 1024, -13.2, 219.65, 21],
      ['Pool heat pump', 902, 18.3, 193.48, 19],
      ['Climate · Annex', 618, -18.1, 132.56, 13],
      ['Kitchen', 486, 9.7, 104.25, 10],
    ]);
    expect(page.items.at(-1)!.name).toBe('Lounge & reception');
  });

  it('Climate (HVAC) detail', () => {
    const climate = zoneType('climate', '2026-09');
    expect(climate.kwh).toBe(1642);
    expect(climate.cost).toBe(352.21);
    expect(climate.peakDay).toMatchObject({ date: '2026-09-14', kwh: 74, note: 'heat wave, 34 °C' });
    expect(Math.round(climate.share * 100)).toBe(34);
    expect(climate.description).toBe('2 sub-zones · 3 meters · air-to-water heat pumps');
    expect(climate.subZones.map((s) => [s.name, s.kwh, Math.round(s.share * 100)])).toEqual([
      ['Main building', 1024, 62],
      ['Annex', 618, 38],
    ]);
  });

  it('Hourly chart for today stops at 22:00 and peaks at 19:00', () => {
    const today = hourly('2026-09-30')!;
    expect(today.points[19]!.kwh).toBe(52.4);
    expect(today.points[19]!.typical).toBe(38.1);
    expect(today.points[22]!.kwh).toBeNull();
  });

  it('History has one point per day and labels 1, 8, 15, 22, 30 Sep', () => {
    const h = history('climate', '30d', '2026-09');
    expect(h.points).toHaveLength(30);
    expect(h.ticks.map((k) => h.points.find((p) => p.key === k)!.label)).toEqual([
      '1 Sep',
      '8 Sep',
      '15 Sep',
      '22 Sep',
      '30 Sep',
    ]);
  });

  it('Alerts: 24 in September, 3 new · 5 reviewed · 16 resolved', () => {
    const page = alerts({ period: '2026-09' });
    expect(page.counts).toEqual({ all: 24, new: 3, reviewed: 5, resolved: 16 });
    expect(page.items.map((a) => a.title).slice(0, 3)).toEqual([
      'Peak over contracted power',
      'Heat pump running in empty rooms',
      'Night consumption above baseline',
    ]);
  });
});
