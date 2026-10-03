import { useId } from 'react';
import { CircleAlert, Plug, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatKwh } from '@/lib/format';

export interface ContractedPowerMeterProps {
  /** Current demand in kW. */
  nowKw: number;
  contractedKw: number;
  className?: string;
}

/**
 * Sidebar "Contracted power" meter (Figma Sidebar › contracted power). State follows the status
 * semantics: Normal < 80% ≤ Attention ≤ 100% < Alert. Exposed as a meter with a text value.
 */
export function ContractedPowerMeter({ nowKw, contractedKw, className }: ContractedPowerMeterProps) {
  const labelId = useId();
  const ratio = nowKw / contractedKw;
  const level = ratio > 1 ? 'critical' : ratio >= 0.8 ? 'warning' : 'good';
  const pct = Math.round(ratio * 100);
  const StateIcon = level === 'critical' ? CircleAlert : TriangleAlert;
  const tone = {
    good: { track: 'bg-good-subtle', fill: 'bg-good-solid', text: 'text-good', label: 'normal' },
    warning: {
      track: 'bg-warning-subtle',
      fill: 'bg-warning-solid',
      text: 'text-warning',
      label: 'attention, at 80% or more',
    },
    critical: {
      track: 'bg-critical-subtle',
      fill: 'bg-critical-solid',
      text: 'text-critical',
      label: 'alert, over contract',
    },
  }[level];

  return (
    <div className={cn('flex w-full flex-col gap-8 rounded-md bg-subtle p-12', className)}>
      <div className="flex items-center gap-6">
        <Plug size={14} aria-hidden="true" className="shrink-0 text-icon-secondary" />
        <p id={labelId} className="min-w-0 flex-1 type-caption-strong text-secondary">
          Contracted power
        </p>
        {level !== 'good' && <StateIcon size={14} aria-hidden="true" className={cn('shrink-0', tone.text)} />}
      </div>
      <div
        role="meter"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={contractedKw}
        aria-valuenow={nowKw}
        aria-valuetext={`${formatKwh(nowKw, 1)} of ${contractedKw} kW now, ${pct}% — ${tone.label}`}
        className={cn('h-6 w-full overflow-hidden rounded-full', tone.track)}
      >
        <div className={cn('h-full rounded-full', tone.fill)} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <p className="flex items-baseline gap-4 whitespace-nowrap" aria-hidden="true">
        <span className="type-data-mono-strong tabular text-primary">{formatKwh(nowKw, 1)}</span>
        <span className="type-caption text-tertiary">
          / {contractedKw} kW now · {pct}%
        </span>
      </p>
    </div>
  );
}
