import { useMemo } from 'react';
import { CircleAlert, Inbox } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatKwh } from '@/lib/format';
import { LegendItem } from '../../ui/LegendItem/LegendItem';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import { ChartFigure, ChartMessage } from '../ChartFigure/ChartFigure';
import { ChartTooltip } from '../ChartTooltip/ChartTooltip';
import { axisTick, chartColor, type TooltipLike, prefersReducedMotion } from '../chartTheme';

export interface HourlyPoint {
  hour: number;
  /** null for hours that haven't happened yet. */
  kwh: number | null;
  typical: number;
}

export interface HourlyConsumptionChartProps {
  data: HourlyPoint[];
  contractedKw: number;
  /** "Typical Tuesday". */
  typicalLabel: string;
  /** "Tue 30 Sep" — used in the tooltip and the text alternative. */
  dayLabel: string;
  status?: 'ready' | 'loading' | 'empty' | 'error';
  onRetry?: () => void;
  errorDetail?: string;
  showTable?: boolean;
  onShowTableChange?: (v: boolean) => void;
  height?: number;
}

type Level = 'normal' | 'peak' | 'over';
const levelOf = (kwh: number, contract: number): Level =>
  kwh > contract ? 'over' : kwh >= contract * 0.8 ? 'peak' : 'normal';
const levelColor: Record<Level, string> = {
  normal: chartColor.bar,
  peak: chartColor.barPeak,
  over: chartColor.barAlert,
};
const hh = (h: number) => String(h).padStart(2, '0');

/**
 * Figma `Chart / Hourly Consumption` (21:1397) · Default, Loading, Empty, Error.
 * Bar colour = state: chart/bar (normal), chart/bar-peak (≥ 80% of contracted power),
 * chart/bar-alert (over contract). The state is repeated in the tooltip, the summary and the table.
 */
export function HourlyConsumptionChart({
  data,
  contractedKw,
  typicalLabel,
  dayLabel,
  status = 'ready',
  onRetry,
  errorDetail = 'Gateway timeout · last update 14:20',
  showTable,
  onShowTableChange,
  height = 240,
}: HourlyConsumptionChartProps) {
  const measured = data.filter((d): d is HourlyPoint & { kwh: number } => d.kwh != null);
  const step = contractedKw / 3;
  const max = Math.max(contractedKw, ...measured.map((d) => d.kwh), ...data.map((d) => d.typical));
  const yTicks = Array.from({ length: Math.floor(max / step) + 2 }, (_, i) => +(i * step).toFixed(2));
  const yMax = yTicks[yTicks.length - 1]!;
  const peak = measured.reduce<(typeof measured)[number] | null>(
    (a, d) => (!a || d.kwh > a.kwh ? d : a),
    null,
  );
  const lastHour = measured.at(-1)?.hour ?? -1;

  const summary = useMemo(() => {
    if (status !== 'ready' || !peak) return `Hourly consumption for ${dayLabel}: no data.`;
    const over = measured.filter((d) => d.kwh > contractedKw);
    const near = measured.filter((d) => levelOf(d.kwh, contractedKw) === 'peak');
    const total = measured.reduce((s, d) => s + d.kwh, 0);
    return [
      `Hourly consumption for ${dayLabel} up to ${hh(lastHour + 1)}:00, ${formatKwh(total)} kWh in total.`,
      `Peak of ${formatKwh(peak.kwh, 1)} kWh at ${hh(peak.hour)}:00 against a ${typicalLabel.toLowerCase()} of ${formatKwh(data[peak.hour]!.typical, 1)} kWh.`,
      over.length
        ? `${over.length} ${over.length === 1 ? 'hour' : 'hours'} over the ${contractedKw} kW contract (${over.map((d) => `${hh(d.hour)}:00`).join(', ')}).`
        : 'No hour over the contracted power.',
      near.length ? `${near.length} more at 80% of the contract or above.` : '',
    ]
      .filter(Boolean)
      .join(' ');
  }, [status, peak, measured, contractedKw, dayLabel, lastHour, typicalLabel, data]);

  const legend =
    status === 'loading' ? (
      <Skeleton width={280} height={10} className="my-3" />
    ) : (
      <div className="flex flex-wrap items-center gap-x-16 gap-y-8" aria-hidden="true">
        <LegendItem color={chartColor.bar}>Today</LegendItem>
        <LegendItem color={chartColor.barPeak}>≥ 80% of contract</LegendItem>
        <LegendItem color={chartColor.barAlert}>Over contract</LegendItem>
        <LegendItem shape="line" color={chartColor.reference}>
          {typicalLabel}
        </LegendItem>
        <LegendItem shape="dashed" color={chartColor.barAlert}>
          Contracted {contractedKw} kW
        </LegendItem>
      </div>
    );

  if (status === 'loading') {
    return (
      <div className="flex flex-col gap-12" aria-busy="true">
        <span className="sr-only">Loading hourly consumption</span>
        {legend}
        <LoadingBars height={height} />
      </div>
    );
  }

  const empty = status === 'empty' || status === 'error';
  // Without data the axes still show the whole day (Figma Empty/Error states).
  const frame = data.length
    ? data
    : Array.from({ length: 24 }, (_, hour) => ({ hour, kwh: null, typical: 0 }));
  const plotData: HourlyPoint[] = empty ? frame.map((d) => ({ ...d, kwh: null })) : frame;
  const reduced = prefersReducedMotion();

  return (
    <ChartFigure
      summary={summary}
      legend={legend}
      showTable={showTable}
      onShowTableChange={onShowTableChange}
      overlay={
        status === 'empty' ? (
          <ChartMessage
            icon={Inbox}
            title="No readings yet today"
            description="The first reading arrives at 00:15."
          />
        ) : status === 'error' ? (
          <ChartMessage
            icon={CircleAlert}
            tone="critical"
            title="Couldn’t load hourly data"
            description={errorDetail}
            onRetry={onRetry}
          />
        ) : undefined
      }
      table={{
        caption: `Hourly consumption, ${dayLabel}`,
        rowKey: (r) => String(r.hour),
        rows: empty ? [] : data,
        columns: [
          { header: 'Hour', cell: (r) => `${hh(r.hour)}:00–${hh((r.hour + 1) % 24)}:00` },
          { header: 'Today (kWh)', align: 'right', cell: (r) => (r.kwh == null ? '—' : formatKwh(r.kwh, 1)) },
          { header: `${typicalLabel} (kWh)`, align: 'right', cell: (r) => formatKwh(r.typical, 1) },
          {
            header: 'State',
            cell: (r) =>
              r.kwh == null
                ? '—'
                : { normal: 'Normal', peak: '≥ 80% of contract', over: 'Over contract' }[
                    levelOf(r.kwh, contractedKw)
                  ],
          },
        ],
      }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={plotData}
          margin={{ top: 7, right: 0, bottom: 0, left: 0 }}
          barCategoryGap={2}
          accessibilityLayer={false}
        >
          <CartesianGrid
            vertical={false}
            stroke={chartColor.grid}
            horizontalValues={yTicks.filter((t) => t > 0 && t !== contractedKw)}
          />
          <XAxis
            dataKey="hour"
            interval={0}
            tickFormatter={(h: number) => (h % 3 === 0 ? hh(h) : '')}
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            tickMargin={16}
            height={33}
          />
          <YAxis
            width={44}
            domain={[0, yMax]}
            ticks={yTicks}
            axisLine={false}
            tickLine={false}
            tick={axisTick}
            tickMargin={8}
            allowDecimals={false}
          />
          <ReferenceLine y={0} stroke={chartColor.axis} />
          {!empty && (
            <Tooltip
              cursor={{ fill: chartColor.hover }}
              isAnimationActive={false}
              content={(p) => (
                <HourlyTooltip
                  {...p}
                  contractedKw={contractedKw}
                  dayLabel={dayLabel}
                  typicalLabel={typicalLabel}
                />
              )}
            />
          )}
          <Bar dataKey="kwh" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={!reduced}>
            {plotData.map((d) => (
              <Cell
                key={d.hour}
                fill={d.kwh == null ? 'transparent' : levelColor[levelOf(d.kwh, contractedKw)]}
              />
            ))}
            {peak && (
              <LabelList
                dataKey="kwh"
                content={({ x, y, width, index }) =>
                  index === peak.hour ? (
                    <text
                      x={Number(x) + Number(width) / 2}
                      y={Number(y) - 8}
                      textAnchor="middle"
                      style={{ font: '500 12px/16px var(--font-sans)', fill: 'var(--color-text-primary)' }}
                    >
                      {Math.round(peak.kwh)} kWh
                    </text>
                  ) : null
                }
              />
            )}
          </Bar>
          {!empty && (
            <Line
              dataKey="typical"
              type="linear"
              stroke={chartColor.reference}
              strokeWidth={1.5}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          )}
          <ReferenceLine
            y={contractedKw}
            stroke={chartColor.barAlert}
            strokeDasharray="4 3"
            ifOverflow="extendDomain"
          />
          {!empty && lastHour >= 0 && lastHour < 23 && (
            <ReferenceLine
              x={23}
              stroke="none"
              label={({ viewBox }: { viewBox?: { x?: number; y?: number; height?: number } }) => (
                <text
                  x={(viewBox?.x ?? 0) + 10}
                  y={(viewBox?.y ?? 0) + (viewBox?.height ?? 0) - 6}
                  textAnchor="end"
                  style={axisTick}
                >
                  Now
                </text>
              )}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFigure>
  );
}

function HourlyTooltip({
  active,
  payload,
  contractedKw,
  dayLabel,
  typicalLabel,
}: TooltipLike & { contractedKw: number; dayLabel: string; typicalLabel: string }) {
  const d = payload?.[0]?.payload as HourlyPoint | undefined;
  if (!active || !d || d.kwh == null) return null;
  const level = levelOf(d.kwh, contractedKw);
  const vsTypical = (d.kwh - d.typical) / d.typical;
  return (
    <ChartTooltip
      title={`${dayLabel} · ${hh(d.hour)}:00–${hh((d.hour + 1) % 24)}:00`}
      rows={[
        { label: 'Today', value: `${formatKwh(d.kwh, 1)} kWh`, color: levelColor[level] },
        {
          label: typicalLabel,
          value: `${formatKwh(d.typical, 1)} kWh`,
          color: chartColor.reference,
          swatch: 'line',
        },
      ]}
      note={
        level === 'over'
          ? { tone: 'critical', text: `Over contract · +${formatKwh(d.kwh - contractedKw, 1)} kW` }
          : level === 'peak'
            ? { tone: 'warning', text: `Peak · ${Math.round(vsTypical * 100)}% above typical` }
            : undefined
      }
    />
  );
}

const loadingHeights = [
  42, 30, 58, 48, 64, 54, 86, 62, 44, 70, 58, 50, 78, 88, 62, 56, 68, 86, 100, 90, 70, 58, 44, 36,
];

/** Figma `State=Loading`: grid + skeleton bars, no axes. */
function LoadingBars({ height }: { height: number }) {
  return (
    <div aria-hidden="true" className="relative ml-44 mt-7" style={{ height: height - 40 }}>
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="absolute inset-x-0 h-px bg-[var(--color-chart-grid)]"
          style={{ top: `${(i / 4) * 100}%` }}
        />
      ))}
      <span className="absolute inset-x-0 bottom-0 h-px bg-[var(--color-chart-axis)]" />
      <div className="absolute inset-0 flex items-end gap-4 px-2">
        {loadingHeights.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-xs bg-skeleton"
            style={{ height: `${h}%`, maxWidth: 24 }}
          />
        ))}
      </div>
    </div>
  );
}
