import { cn } from '@/lib/cn';

export interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
}

/**
 * The 72×24 trend line inside the KPI Card: chart/bar stroke, brand dot on the latest value.
 * Decorative — the Delta next to it states the change in words.
 */
export function Sparkline({ values, width = 72, height = 24, className }: SparklineProps) {
  if (values.length < 2) return <span className={className} style={{ width, height }} aria-hidden="true" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (i: number) => 1 + (i * (width - 2)) / (values.length - 1);
  const y = (v: number) => height - 4 - ((v - min) / span) * (height - 10);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join('');
  const last = values.length - 1;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
      className={cn('shrink-0 overflow-visible', className)}
    >
      <path
        d={d}
        className="stroke-chart-bar"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={x(last)} cy={y(values[last]!)} r="2.5" className="fill-icon-brand" />
    </svg>
  );
}
