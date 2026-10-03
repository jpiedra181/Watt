/**
 * Figma `Menu Item` (11:136): 36px, padding 0 × space/8, radius/sm, Body/Small.
 * Hover → bg/hover · Selected → Body/Small Strong + brand check · Disabled → text/disabled.
 * Shared by Select options and Dropdown Menu items (Radix sets the data-attributes).
 */
export const menuItemClass = [
  'relative flex h-36 w-full min-w-0 cursor-pointer select-none items-center gap-8 rounded-sm px-8',
  'type-body-small text-primary outline-none',
  'data-[highlighted]:bg-hover',
  'data-[state=checked]:font-medium',
  'data-[disabled]:cursor-not-allowed data-[disabled]:text-disabled',
].join(' ');

export const menuItemIconClass = 'shrink-0 text-icon-secondary group-data-[disabled]/item:text-icon-disabled';

/** Figma `Dropdown Menu` (11:141): surface-raised, border/default, Elevation/2, radius/md, 4px inset. */
export const menuSurfaceClass = [
  'z-50 flex min-w-[220px] flex-col gap-2 overflow-hidden rounded-md border border-default bg-surface-raised p-4',
  'shadow-elevation-2 outline-none',
].join(' ');
