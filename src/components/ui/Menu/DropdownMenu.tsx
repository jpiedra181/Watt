import type { ComponentProps, ReactNode } from 'react';
import { Check, type LucideIcon } from 'lucide-react';
import { DropdownMenu as M } from 'radix-ui';
import { cn } from '@/lib/cn';
import { menuItemClass, menuItemIconClass, menuSurfaceClass } from './menuItem';

/** Figma `Dropdown Menu` (11:141) built on Radix: roving focus, typeahead, Esc to close. */
export const DropdownMenu = M.Root;
export const DropdownMenuTrigger = M.Trigger;
export const DropdownMenuGroup = M.Group;
export const DropdownMenuRadioGroup = M.RadioGroup;

export function DropdownMenuContent({
  className,
  align = 'end',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={8}
        className={cn(menuSurfaceClass, className)}
        {...props}
      />
    </M.Portal>
  );
}

interface ItemProps extends ComponentProps<typeof M.Item> {
  icon?: LucideIcon;
  /** Destructive actions use the critical text colour. */
  tone?: 'default' | 'critical';
}

export function DropdownMenuItem({ icon: Icon, tone = 'default', className, children, ...props }: ItemProps) {
  return (
    <M.Item
      className={cn('group/item', menuItemClass, tone === 'critical' && 'text-critical', className)}
      {...props}
    >
      {Icon && (
        <Icon
          size={16}
          aria-hidden="true"
          className={cn(menuItemIconClass, tone === 'critical' && 'text-critical')}
        />
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </M.Item>
  );
}

interface CheckableProps {
  icon?: LucideIcon;
  children: ReactNode;
}

export function DropdownMenuRadioItem({
  icon: Icon,
  className,
  children,
  ...props
}: ComponentProps<typeof M.RadioItem> & CheckableProps) {
  return (
    <M.RadioItem className={cn('group/item', menuItemClass, className)} {...props}>
      {Icon && <Icon size={16} aria-hidden="true" className={menuItemIconClass} />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <M.ItemIndicator>
        <Check size={16} aria-hidden="true" className="text-icon-brand" />
      </M.ItemIndicator>
    </M.RadioItem>
  );
}

export function DropdownMenuCheckboxItem({
  icon: Icon,
  className,
  children,
  ...props
}: ComponentProps<typeof M.CheckboxItem> & CheckableProps) {
  return (
    <M.CheckboxItem className={cn('group/item', menuItemClass, className)} {...props}>
      {Icon && <Icon size={16} aria-hidden="true" className={menuItemIconClass} />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      <M.ItemIndicator>
        <Check size={16} aria-hidden="true" className="text-icon-brand" />
      </M.ItemIndicator>
    </M.CheckboxItem>
  );
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof M.Separator>) {
  return (
    <M.Separator
      className={cn('mx-[-4px] my-2 h-px bg-[var(--color-border-subtle)]', className)}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof M.Label>) {
  return <M.Label className={cn('px-8 pb-2 pt-6 type-label-overline text-tertiary', className)} {...props} />;
}

/**
 * Static Menu Item for documentation (Figma `Menu Item` states side by side).
 * Not interactive — real menus use DropdownMenuItem / Select options.
 */
export function MenuItemPreview({
  icon: Icon,
  state = 'default',
  children,
}: {
  icon?: LucideIcon;
  state?: 'default' | 'hover' | 'selected' | 'disabled';
  children: ReactNode;
}) {
  return (
    <div
      className={cn('group/item w-[220px]', menuItemClass, 'cursor-default')}
      data-highlighted={state === 'hover' ? '' : undefined}
      data-state={state === 'selected' ? 'checked' : undefined}
      data-disabled={state === 'disabled' ? '' : undefined}
    >
      {Icon && <Icon size={16} aria-hidden="true" className={menuItemIconClass} />}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {state === 'selected' && <Check size={16} aria-hidden="true" className="text-icon-brand" />}
    </div>
  );
}
