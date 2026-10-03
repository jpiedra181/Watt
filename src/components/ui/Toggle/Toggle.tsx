import { useId, type ReactNode } from 'react';
import { Switch as S } from 'radix-ui';
import { cn } from '@/lib/cn';
import { Spinner } from '../Spinner/Spinner';

export interface ToggleProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  hideLabel?: boolean;
  disabled?: boolean;
  /** The change is being saved: a spinner sits in the knob and the switch ignores input. */
  loading?: boolean;
  /** Extra text after the label, e.g. "· Pro plan". */
  hint?: ReactNode;
  name?: string;
  id?: string;
  className?: string;
}

/**
 * Figma `Toggle` (11:559) — switch 36×20, knob 16 (20 wide while pressed). On = bg/brand.
 * Disabled = 45% opacity track. role="switch" from Radix.
 */
export function Toggle({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  hideLabel,
  disabled,
  loading,
  hint,
  name,
  id,
  className,
}: ToggleProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  return (
    <span className={cn('group/tg inline-flex items-center gap-8', className)}>
      <S.Root
        id={switchId}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={(v) => !loading && onCheckedChange?.(v)}
        disabled={disabled}
        name={name}
        aria-busy={loading || undefined}
        aria-label={hideLabel && typeof label === 'string' ? label : undefined}
        className={cn(
          'peer relative flex h-20 w-36 shrink-0 cursor-pointer items-center rounded-full p-2 outline-none',
          'transition-[background-color,box-shadow] duration-150',
          'bg-track group-hover/tg:not-data-[disabled]:bg-track-hover',
          'data-[state=checked]:bg-brand group-hover/tg:not-data-[disabled]:data-[state=checked]:bg-brand-hover',
          'active:data-[state=checked]:bg-brand-pressed',
          'focus-visible:shadow-focus-ring',
          'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-45',
        )}
      >
        <S.Thumb
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-icon-on-brand)] shadow-elevation-1',
            'transition-[transform,width] duration-150',
            'data-[state=checked]:translate-x-16',
            !loading &&
              'group-active/tg:not-data-[disabled]:w-20 group-active/tg:not-data-[disabled]:data-[state=checked]:translate-x-12',
          )}
        >
          {loading && <Spinner size={12} />}
        </S.Thumb>
      </S.Root>
      {label && !hideLabel && (
        <label
          htmlFor={switchId}
          className={cn(
            'cursor-pointer select-none type-body-small',
            disabled ? 'cursor-not-allowed text-disabled' : 'text-primary',
          )}
        >
          {label}
          {hint && <span className={disabled ? 'text-disabled' : 'text-tertiary'}> {hint}</span>}
        </label>
      )}
    </span>
  );
}
