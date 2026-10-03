import { useMemo } from 'react';
import { CircleAlert, Inbox } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type XAxisTickContentProps,
} from 'recharts';
import { formatKwh } from '@/lib/format';
import { LegendItem } from '../../ui/LegendItem/LegendItem';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import { ChartFigure, ChartMessage } from '../ChartFigure/ChartFigure';
import { ChartTooltip } from '../ChartTooltip/ChartTooltip';
import { axisTick, chartColor, type TooltipLike, niceTicks, prefersReducedMotion } from '../chartTheme';

export interface HistoryPoint {
  /** Unique x key, e.g. "2026-09-14". */
  key: string;
  /** Axis label, e.g. "14 Sep". */
  label: string;
  /** Tooltip title, e.g. "Sun 14 Sep". */
  longLabel: string;
  value: number | null;
  previous: number | null;
}

export interface HistoryChartProps {
  data: HistoryPoint[];
  /** "Climate (HVAC) · September". */
  seriesLabel: string;
  /** "August". */
  previousLabel: string;
  /** Zone series colour token. */
  color: string;
  /** Keys to label on the x axis (Figma: 1, 8, 15, 22, 30 Sep). */
  ticks?: string[];
  status?: 'ready' | 'loading' | 'empty' | 'error';
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  height?: number;
}

/**
 * Figma `Chart / History` (21:1526) · Default, Loading, Empty.
 * Line + 10% area wash in the zone's series colour vs the previous period (dashed).
 * The peak is the only labelled point.
 */
export function HistoryChart({
  data,
  seriesLabel,
  previousLabel,
  color,
  ticks,
  status = 'ready',
  emptyTitle = 'No history for this range',
  emptyDescription,
  onRetry,
  height = 280,
}: HistoryChartProps) {
  const values = data.flatMap((d) => [d.value ?? 0, d.previous ?? 0]);
  const yTicks = niceTicks(Math.max(...values, 1), 4);
  const peak = data.reduce<HistoryPoint | null>(
    (a, d) => (d.value != null && (!a || d.value > (a.value ?? 0)) ? d : a),
    null,
  );

  const summary = useMemo(() => {
    const current = data.filter((d) => d.value != null);
    if (status !== 'ready' || !peak || !current.length) return `${seriesLabel}: no data for this range.`;
    const total = current.reduce((s, d) => s + (d.value ?? 0), 0);
    const prev = data.reduce((s, d) => s + (d.previous ?? 0), 0);
    const change = prev ? (total - prev) / prev : 0;
    return `${seriesLabel}: ${formatKwh(total, 0)} kWh across ${current.length} points, ${Math.abs(Math.round(change * 100))}% ${
      change <= 0 ? 'less' : 'more'
    } than ${previousLabel}. Peak ${formatKwh(peak.value!, 0)} kWh on ${peak.longLabel}.`;
  }, [data, peak, previousLabel, seriesLabel, status]);

  const legend =
    status === 'loading' ? (
      <Skeleton width={160} height={10} className="my-3" />
    ) : (
      <div className="flex flex-wrap items-center gap-x-16 gap-y-8" aria-hidden="true">
        <LegendItem shape="line" color={color}>
          {seriesLabel}
        </LegendItem>
        <LegendItem shape="dashed" color={chartColor.cursor}>
          {previousLabel}
        </LegendItem>
      </div>
    );

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-12" aria-busy="true">
        <span className="sr-only">Loading consumption history</span>
        {legend}
        <div
          className="relative ml-44 mt-7 flex flex-col justify-end"
          style={{ height: height - 40 }}
          aria-hidden="true"
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              className="absolute inset-x-0 h-px bg-[var(--color-chart-grid)]"
              style={{ top: `${i * 22}%` }}
            />
          ))}
          <Skeleton shape="block" width="100%" height="58%" />
        </div>
      </div>
    );
  }

  const empty = status !== 'ready' || !peak;
  const reduced = prefersReducedMotion();

  return (
    <ChartFigure
      summary={summary}
      legend={legend}
      overlay={
        status === 'error' ? (
          <ChartMessage
            icon={CircleAlert}
            tone="critical"
            title="Couldn’t load history"
            description="Try again in a moment."
            onRetry={onRetry}
          />
        ) : empty ? (
          <ChartMessage icon={Inbox} title={emptyTitle} description={emptyDescription} />
        ) : undefined
      }
      table={{
        caption: seriesLabel,
        rowKey: (r) => r.key,
        rows: empty ? [] : data,
        columns: [
          { header: 'Date', cell: (r) => r.longLabel },
          {
            header: 'kWh',
            align: 'right',
            cell: (r) => (r.value == null ? '—' : formatKwh(r.value, r.value < 10 ? 1 : 0)),
          },
          {
            header: `${previousLabel} (kWh)`,
            align: 'right',
            cell: (r) => (r.previous == null ? '—' : formatKwh(r.previous, r.previous < 10 ? 1 : 0)),
          },
        ],
      }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 7, right: 0, bottom: 0, left: 0 }}
          accessibilityLayer={false}
          style={{ overflow: 'visible' }}
        >
          <CartesianGrid vertical={false} stroke={chartColor.grid} horizontalValues={yTicks.slice(1)} />
          <XAxis
            dataKey="key"
            ticks={ticks}
            interval={ticks ? 0 : 'preserveStartEnd'}
            axisLine={false}
            tickLine={false}
            tick={(p: XAxisTickContentProps) => (
              // Figma: the first label starts at the plot edge, the last one ends at it.
              <text
                x={p.x}
                y={p.y}
                dy="0.71em"
                textAnchor={p.index === 0 ? 'start' : p.index === p.visibleTicksCount - 1 ? 'end' : 'middle'}
                style={axisTick}
              >
                {data.find((d) => d.key === String(p.payload.value))?.label ?? ''}
              </text>
            )}
            tickMargin={16}
            height={33}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis
            width={44}
            domain={[0, yTicks.at(-1)!]}
            ticks={yTicks}
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            tickMargin={8}
          />
          <ReferenceLine y={0} stroke={chartColor.axis} />
          {!empty && (
            <Tooltip
              isAnimationActive={false}
              cursor={{ stroke: chartColor.cursor, strokeDasharray: '3 3' }}
              content={(p) => (
                <HistoryTooltip
                  {...p}
                  color={color}
                  seriesLabel={seriesLabel}
                  previousLabel={previousLabel}
                />
              )}
            />
          )}
          {!empty && (
            <Line
              dataKey="previous"
              type="linear"
              stroke={chartColor.cursor}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          )}
          {!empty && (
            <Area
              dataKey="value"
              type="linear"
              stroke={color}
              strokeWidth={2}
              fill={color}
              className="chart-area-wash"
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: chartColor.surface, strokeWidth: 2 }}
              isAnimationActive={!reduced}
            />
          )}
          {!empty && peak && (
            <ReferenceDot
              x={peak.key}
              y={peak.value!}
              r={5}
              fill={color}
              stroke={chartColor.surface}
              strokeWidth={2}
              label={({ viewBox }: { viewBox?: { x?: number; y?: number } }) => (
                <PeakLabel
                  x={viewBox?.x ?? 0}
                  y={viewBox?.y ?? 0}
                  text={`Peak · ${formatKwh(peak.value!, 0)} kWh · ${peak.label}`}
                />
              )}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

/** Figma peak tag: surface pill with border, Caption/Strong, anchored up-right of the point. */
function PeakLabel({ x, y, text }: { x: number; y: number; text: string }) {
  const w = text.length * 6.4 + 12;
  return (
    <foreignObject x={x + 11} y={y - 27} width={w} height={20} style={{ overflow: 'visible' }}>
      <span className="inline-block whitespace-nowrap rounded-xs border border-default bg-surface px-4 type-caption-strong text-primary">
        {text}
      </span>
    </foreignObject>
  );
}

function HistoryTooltip({
  active,
  payload,
  color,
  seriesLabel,
  previousLabel,
}: TooltipLike & { color: string; seriesLabel: string; previousLabel: string }) {
  const d = payload?.[0]?.payload as HistoryPoint | undefined;
  if (!active || !d) return null;
  return (
    <ChartTooltip
      title={d.longLabel}
      rows={[
        {
          label: seriesLabel.split(' · ')[0]!,
          value: d.value == null ? '—' : `${formatKwh(d.value, d.value < 10 ? 1 : 0)} kWh`,
          color,
          swatch: 'line',
        },
        {
          label: previousLabel,
          value: d.previous == null ? '—' : `${formatKwh(d.previous, d.previous < 10 ? 1 : 0)} kWh`,
          color: chartColor.cursor,
          swatch: 'dashed',
        },
      ]}
    />
  );
}
