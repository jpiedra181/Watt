import { ToggleGroup } from 'radix-ui';
import { cn } from '@/lib/cn';
import { tabListClass, tabTriggerClass } from '../Tabs/Tabs';

export interface RangeSelectorProps<V extends string> {
  options: readonly { value: V; label: string; description?: string }[];
  value: V;
  onValueChange: (value: V) => void;
  /** Names the group for assistive tech, e.g. "Chart range". */
  label: string;
  className?: string;
}

/**
 * Figma `Range Selector` (13:299) — the Segmented tab style as a single-choice group.
 * It changes what a chart shows rather than switching panels, so it is a radio group
 * (Radix ToggleGroup type="single": arrow keys move, Space/Enter selects) instead of tabs.
 */
export function RangeSelector<V extends string>({
  options,
  value,
  onValueChange,
  label,
  className,
}: RangeSelectorProps<V>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(v) => v && onValueChange(v as V)}
      aria-label={label}
      className={cn(tabListClass.segmented, className)}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          aria-label={o.description}
          className={cn(tabTriggerClass.segmented, 'tabular')}
        >
          {o.label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
