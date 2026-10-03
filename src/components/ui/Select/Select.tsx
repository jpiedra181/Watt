import type { ReactNode } from 'react';
import { Check, ChevronDown, type LucideIcon } from 'lucide-react';
import { Select as S } from 'radix-ui';
import { cn } from '@/lib/cn';
import { Field } from '../Field/Field';
import { menuItemClass, menuItemIconClass, menuSurfaceClass } from '../Menu/menuItem';
import { Spinner } from '../Spinner/Spinner';

export interface SelectOption<V extends string = string> {
  value: V;
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface SelectProps<V extends string = string> {
  options: readonly SelectOption<V>[];
  value?: V;
  defaultValue?: V;
  onValueChange?: (value: V) => void;
  label?: ReactNode;
  hideLabel?: boolean;
  placeholder?: string;
  helper?: ReactNode;
  error?: ReactNode;
  leadingIcon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  name?: string;
  /** md = 36px field (Figma Select) · sm = 32px (rows-per-page in Pagination). */
  size?: 'md' | 'sm';
  /** Controlled open state — docs only. */
  open?: boolean;
  className?: string;
  triggerClassName?: string;
}

const trigger = {
  base: [
    'group flex w-full min-w-0 cursor-pointer items-center overflow-hidden rounded-md border',
    'border-strong bg-surface text-left type-body-small text-primary outline-none',
    'transition-[border-color,box-shadow] duration-100',
    'hover:border-hover focus-visible:border-focus focus-visible:shadow-focus-ring',
    'data-[state=open]:border-focus data-[state=open]:shadow-focus-ring',
    'aria-[invalid=true]:border-critical',
    'data-[disabled]:cursor-not-allowed data-[disabled]:border-default data-[disabled]:bg-disabled data-[disabled]:text-disabled',
  ].join(' '),
  md: 'h-36 gap-8 px-12',
  sm: 'h-32 gap-4 px-8',
};

/**
 * Figma `Select` (11:377) on Radix Select. Keyboard: ↑/↓ to move, Enter to choose, Esc to close,
 * typeahead. States: Default, Hover, Focus, Open, Filled, Disabled, Error, Loading.
 */
export function Select<V extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  label,
  hideLabel,
  placeholder = 'Select an option',
  helper,
  error,
  leadingIcon: Leading,
  loading,
  disabled,
  name,
  size = 'md',
  open,
  className,
  triggerClassName,
}: SelectProps<V>) {
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
        <S.Root
          value={value}
          defaultValue={defaultValue}
          onValueChange={(v) => onValueChange?.(v as V)}
          disabled={disabled}
          name={name}
          open={open}
        >
          <S.Trigger
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={invalid || undefined}
            aria-busy={loading || undefined}
            className={cn(trigger.base, trigger[size], triggerClassName)}
          >
            {Leading && (
              <Leading
                size={16}
                aria-hidden="true"
                className="shrink-0 text-icon-secondary group-data-[disabled]:text-icon-disabled"
              />
            )}
            <span className="min-w-0 flex-1 truncate group-data-[placeholder]:text-tertiary">
              <S.Value placeholder={placeholder} />
            </span>
            {loading ? (
              <Spinner />
            ) : (
              <S.Icon asChild>
                <ChevronDown
                  size={size === 'sm' ? 14 : 16}
                  aria-hidden="true"
                  className="shrink-0 text-icon-secondary transition-transform group-data-[state=open]:rotate-180 group-data-[disabled]:text-icon-disabled"
                />
              </S.Icon>
            )}
          </S.Trigger>
          <S.Portal>
            <S.Content
              position="popper"
              sideOffset={4}
              collisionPadding={8}
              className={cn(
                menuSurfaceClass,
                'min-w-[max(var(--radix-select-trigger-width),120px)] max-h-[min(360px,var(--radix-select-content-available-height))]',
              )}
            >
              <S.Viewport className="flex flex-col gap-2">
                {options.map((o) => (
                  <S.Item
                    key={o.value}
                    value={o.value}
                    disabled={o.disabled}
                    className={cn('group/item', menuItemClass)}
                  >
                    {o.icon && <o.icon size={16} aria-hidden="true" className={menuItemIconClass} />}
                    <span className="min-w-0 flex-1 truncate">
                      <S.ItemText>{o.label}</S.ItemText>
                    </span>
                    <S.ItemIndicator>
                      <Check size={16} aria-hidden="true" className="text-icon-brand" />
                    </S.ItemIndicator>
                  </S.Item>
                ))}
              </S.Viewport>
            </S.Content>
          </S.Portal>
        </S.Root>
      )}
    </Field>
  );
}
