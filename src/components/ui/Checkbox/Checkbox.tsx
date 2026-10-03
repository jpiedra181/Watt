import { useId, type ReactNode } from 'react';
import { Check, Minus } from 'lucide-react';
import { Checkbox as C } from 'radix-ui';
import { cn } from '@/lib/cn';

export interface CheckboxProps {
  checked?: boolean | 'indeterminate';
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  /** Keep an accessible name without the visible label (table row selection). */
  hideLabel?: boolean;
  disabled?: boolean;
  /** Figma `State=Error`: border/critical (+ bg/danger when checked). Pair it with a message. */
  invalid?: boolean;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  'aria-describedby'?: string;
}

/**
 * Figma `Checkbox` (11:478) · Checked Off / On / Indeterminate × Default, Hover, Focus, Pressed,
 * Disabled, Error. 16px box, radius/xs; hover/pressed react to the whole label, like the native control.
 */
export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  hideLabel,
  disabled,
  invalid,
  name,
  value,
  id,
  className,
  ...aria
}: CheckboxProps) {
  const autoId = useId();
  const boxId = id ?? autoId;
  return (
    <span className={cn('group/cb inline-flex items-center gap-8', className)}>
      <C.Root
        id={boxId}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(v) => onCheckedChange?.(v === true)}
        disabled={disabled}
        name={name}
        value={value}
        aria-invalid={invalid || undefined}
        aria-label={hideLabel && typeof label === 'string' ? label : undefined}
        aria-describedby={aria['aria-describedby']}
        className={cn(
          'peer relative flex size-16 shrink-0 cursor-pointer items-center justify-center rounded-xs border outline-none',
          'transition-[background-color,border-color,box-shadow] duration-100',
          // Off
          'border-strong bg-surface',
          'group-hover/cb:not-data-[disabled]:border-hover group-hover/cb:not-data-[disabled]:bg-hover',
          'active:border-hover active:bg-pressed',
          'focus-visible:border-focus focus-visible:shadow-focus-ring',
          // On / Indeterminate
          'data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand',
          'group-hover/cb:not-data-[disabled]:data-[state=checked]:bg-brand-hover group-hover/cb:not-data-[disabled]:data-[state=indeterminate]:bg-brand-hover',
          'active:data-[state=checked]:bg-brand-pressed active:data-[state=indeterminate]:bg-brand-pressed',
          // Error
          'aria-[invalid=true]:border-critical aria-[invalid=true]:data-[state=checked]:bg-danger aria-[invalid=true]:data-[state=indeterminate]:bg-danger',
          // Disabled
          'data-[disabled]:cursor-not-allowed data-[disabled]:border-default data-[disabled]:bg-disabled',
        )}
      >
        <C.Indicator className="flex text-icon-on-brand group-has-data-[disabled]/cb:text-icon-disabled">
          {checked === 'indeterminate' ? (
            <Minus size={12} aria-hidden="true" />
          ) : (
            <Check size={12} aria-hidden="true" />
          )}
        </C.Indicator>
      </C.Root>
      {label && !hideLabel && (
        <label
          htmlFor={boxId}
          className={cn(
            'cursor-pointer select-none type-body-small',
            disabled ? 'cursor-not-allowed text-disabled' : 'text-primary',
          )}
        >
          {label}
        </label>
      )}
    </span>
  );
}
