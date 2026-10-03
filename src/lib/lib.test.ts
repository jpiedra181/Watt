import { describe, expect, it } from 'vitest';
import { alertGroup, minutesAgo, relativeDay } from './dates';
import { formatDayLong, formatEuro, formatKwh, formatPercent, parseLocal } from './format';
import { consumptionDelta } from './zones';

describe('format', () => {
  it('formats numbers like the Figma screens', () => {
    expect(formatKwh(4812)).toBe('4,812');
    expect(formatKwh(52.4)).toBe('52.4');
    expect(formatEuro(1032.75)).toBe('1,032.75');
    expect(formatPercent(-0.061)).toBe('6.1%');
  });

  it('labels the demo day as in Figma (Tuesday, 30 September)', () => {
    expect(formatDayLong(parseLocal('2026-09-30T19:42'))).toBe('Tuesday, 30 September');
  });
});

describe('dates', () => {
  const now = '2026-09-30T22:14';
  it('relative days for the Overview alert list', () => {
    expect(relativeDay('2026-09-30T19:42', now)).toBe('19:42');
    expect(relativeDay('2026-09-29T23:50', now)).toBe('Yesterday');
    expect(relativeDay('2026-09-27T19:30', now)).toBe('Sat 27 Sep');
  });
  it('groups for the Alerts page', () => {
    expect(alertGroup('2026-09-30T03:10', now).label).toBe('Today · 30 Sep');
    expect(alertGroup('2026-09-25T16:48', now).label).toBe('Earlier this week');
    expect(alertGroup('2026-08-29T17:35', now).label).toBe('August 2026');
  });
  it('minutes ago', () => {
    expect(minutesAgo('2026-09-30T22:12', now)).toBe('2 min ago');
  });
});

describe('consumptionDelta', () => {
  it('more energy is bad news, less is good, under 2% is neutral', () => {
    expect(consumptionDelta(902, 762)).toMatchObject({ direction: 'up', sentiment: 'negative' });
    expect(consumptionDelta(1024, 1180)).toMatchObject({ direction: 'down', sentiment: 'positive' });
    expect(consumptionDelta(188, 184.5)).toMatchObject({ direction: 'up', sentiment: 'neutral' });
  });
});
