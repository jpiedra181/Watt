import { createContext, use, type ComponentProps, type ReactNode } from 'react';
import { Tabs as T } from 'radix-ui';
import { cn } from '@/lib/cn';

type TabStyle = 'underline' | 'segmented';
const StyleContext = createContext<TabStyle>('underline');

/**
 * Figma `Tab` (13:286) on Radix Tabs — role="tablist", ←/→ move focus, Home/End jump.
 * Underline = page views (Alerts filters) · Segmented = ranges.
 */
export const Tabs = T.Root;

export const tabTriggerClass: Record<TabStyle, string> = {
  underline: [
    'group relative -mb-px inline-flex shrink-0 cursor-pointer items-center gap-6 whitespace-nowrap px-12 py-10',
    'border-b-2 border-transparent type-body-small-strong text-secondary outline-none',
    'transition-[color,border-color,box-shadow] duration-100',
    'not-disabled:hover:border-strong not-disabled:hover:text-primary',
    'data-[state=active]:border-brand data-[state=active]:text-primary data-[state=active]:hover:border-brand',
    'aria-checked:border-brand aria-checked:text-primary',
    'focus-visible:rounded-sm focus-visible:shadow-focus-ring',
    'disabled:cursor-not-allowed disabled:text-disabled',
  ].join(' '),
  segmented: [
    'group inline-flex shrink-0 cursor-pointer items-center justify-center gap-6 whitespace-nowrap rounded-sm px-12 py-4',
    'border border-transparent type-body-small-strong text-secondary outline-none',
    'transition-[color,background-color,box-shadow] duration-100',
    'not-disabled:hover:bg-pressed not-disabled:hover:text-primary',
    'data-[state=active]:border-default data-[state=active]:bg-surface data-[state=active]:text-primary data-[state=active]:shadow-elevation-1 data-[state=active]:hover:bg-surface',
    'data-[state=on]:border-default data-[state=on]:bg-surface data-[state=on]:text-primary data-[state=on]:shadow-elevation-1 data-[state=on]:hover:bg-surface',
    'focus-visible:shadow-focus-ring',
    'disabled:cursor-not-allowed disabled:text-disabled',
  ].join(' '),
};

export const tabListClass: Record<TabStyle, string> = {
  underline: 'flex min-w-0 items-end',
  segmented: 'inline-flex items-center gap-2 rounded-md bg-hover p-2',
};

export function TabsList({
  variant = 'underline',
  className,
  ...props
}: ComponentProps<typeof T.List> & { variant?: TabStyle }) {
  return (
    <StyleContext value={variant}>
      <T.List className={cn(tabListClass[variant], className)} {...props} />
    </StyleContext>
  );
}

export function TabCount({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        'rounded-full bg-hover px-6 type-caption-strong text-secondary',
        'group-data-[state=active]:bg-brand-subtle group-data-[state=active]:text-brand',
        'group-data-[state=on]:bg-brand-subtle group-data-[state=on]:text-brand',
        'group-disabled:text-disabled',
      )}
    >
      {children}
    </span>
  );
}

export function TabsTrigger({
  count,
  className,
  children,
  ...props
}: ComponentProps<typeof T.Trigger> & { count?: ReactNode }) {
  const variant = use(StyleContext);
  return (
    <T.Trigger className={cn(tabTriggerClass[variant], className)} {...props}>
      {children}
      {count !== undefined && <TabCount>{count}</TabCount>}
    </T.Trigger>
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof T.Content>) {
  return <T.Content className={cn('outline-none focus-visible:shadow-focus-ring', className)} {...props} />;
}
