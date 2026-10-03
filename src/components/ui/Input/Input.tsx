import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { CircleAlert, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Field, fieldBox } from '../Field/Field';
import { Spinner } from '../Spinner/Spinner';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  hideLabel?: boolean;
  helper?: ReactNode;
  /** Error message. Turns the border critical, adds an icon in the field and replaces the helper. */
  error?: ReactNode;
  leadingIcon?: LucideIcon;
  /** Shows a spinner at the end of the field (e.g. async validation, search in flight). */
  loading?: boolean;
  /** Extra classes for the outer wrapper (width, grid placement). */
  className?: string;
  /** Extra classes for the bordered field box. */
  fieldClassName?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Figma `Input` (9:399) · States: Default, Hover, Focus, Filled, Disabled, Error, Loading.
 * Error is never colour alone: border/critical + AlertCircle icon + message.
 */
export function Input({
  label,
  hideLabel,
  helper,
  error,
  leadingIcon: Leading,
  loading,
  disabled,
  className,
  fieldClassName,
  ...props
}: InputProps) {
  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      helper={helper}
      error={error}
      disabled={disabled}
      className={className}
    >
      {({ inputId, describedBy, invalid }) => (
        <div
          className={cn(fieldBox, fieldClassName)}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
        >
          {Leading && (
            <Leading
              size={16}
              aria-hidden="true"
              className={cn('shrink-0', disabled ? 'text-icon-disabled' : 'text-icon-secondary')}
            />
          )}
          <input
            id={inputId}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-busy={loading || undefined}
            className="h-full min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-tertiary disabled:cursor-not-allowed"
            {...props}
          />
          {invalid && <CircleAlert size={16} aria-hidden="true" className="shrink-0 text-critical" />}
          {loading && !invalid && <Spinner />}
        </div>
      )}
    </Field>
  );
}
