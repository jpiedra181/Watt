/**
 * Recharts reads colours as SVG attributes, so every chart colour is a CSS variable from the
 * Theme collection — the charts switch with light/dark without re-rendering.
 */
export const chartColor = {
  bar: 'var(--color-chart-bar)',
  barPeak: 'var(--color-chart-bar-peak)',
  barAlert: 'var(--color-chart-bar-alert)',
  reference: 'var(--color-chart-reference)',
  grid: 'var(--color-chart-grid)',
  axis: 'var(--color-chart-axis)',
  cursor: 'var(--color-chart-cursor)',
  area: 'var(--color-chart-area)',
  peakBand: 'var(--color-chart-peak-band)',
  surface: 'var(--color-bg-surface)',
  hover: 'var(--color-bg-hover)',
  series: [
    'var(--color-chart-series-1)',
    'var(--color-chart-series-2)',
    'var(--color-chart-series-3)',
    'var(--color-chart-series-4)',
  ],
  other: 'var(--color-chart-series-other)',
} as const;

/** Figma `Data/Axis`: Geist Mono 11/14, text/tertiary. */
export const axisTick = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fill: 'var(--color-text-tertiary)',
} as const;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A tick step that lands on round numbers: 1, 2, 2.5, 5 × 10ⁿ. */
export function niceStep(rough: number) {
  const pow = 10 ** Math.floor(Math.log10(rough));
  const n = rough / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pow;
}

export function niceTicks(max: number, count = 4) {
  const step = niceStep(Math.max(max, 1) / count);
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(6));
}

/** The bit of Recharts' tooltip props our custom tooltips read. */
export interface TooltipLike {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: unknown }>;
}
