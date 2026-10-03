import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Shared field chrome for Input and Select (Figma: 36px field, radius/md, padding 0 × space/12).
 * Hover → border/hover · Focus/Open → border/focus + Focus/Ring · Error → border/critical ·
 * Disabled → bg/disabled + border/default.
 */
export const fieldBox = [
  'flex h-36 w-full min-w-0 items-center gap-8 overflow-hidden rounded-md border px-12',
  'border-strong bg-surface type-body-small text-primary',
  'transition-[border-color,box-shadow] duration-100',
  'hover:border-hover',
  'has-[:focus-visible]:border-focus has-[:focus-visible]:shadow-focus-ring',
  'data-[invalid=true]:border-critical',
  'data-[disabled=true]:border-default data-[disabled=true]:bg-disabled data-[disabled=true]:text-disabled data-[disabled=true]:hover:border-default',
].join(' ');

export interface FieldProps {
  label?: ReactNode;
  /** Keeps the label for assistive tech but hides it visually (search boxes, table filters). */
  hideLabel?: boolean;
  helper?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  className?: string;
  children: (ids: { inputId: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/** Label + control + helper / error row. Wires ids so the helper and error are announced. */
export function Field({ label, hideLabel, helper, error, disabled, className, children }: FieldProps) {
  const id = useId();
  const inputId = `${id}-control`;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error);
  const describedBy = cn(invalid ? errorId : helper ? helperId : '') || undefined;

  return (
    <div className={cn('flex w-full flex-col gap-6', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'type-body-small-strong',
            disabled ? 'text-disabled' : 'text-primary',
            hideLabel && 'sr-only',
          )}
        >
          {label}
        </label>
      )}
      {children({ inputId, describedBy, invalid })}
      {invalid ? (
        <p id={errorId} className="type-caption text-critical">
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className={cn('type-caption', disabled ? 'text-disabled' : 'text-tertiary')}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}
