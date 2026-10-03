import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/cn';
import { Spinner } from '../Spinner/Spinner';

/**
 * Figma `Button` (9:216) · Variant × State.
 * Hover / Focus / Pressed are CSS states; Disabled and Loading are props.
 * Height 36, radius/md, padding space/8 × space/16, label Body/Small Strong.
 */
export const buttonVariants = cva(
  [
    'group relative inline-flex h-36 shrink-0 cursor-pointer items-center justify-center gap-6 whitespace-nowrap',
    'rounded-md border px-16 type-body-small-strong outline-none select-none',
    'transition-[background-color,border-color,box-shadow,color] duration-100',
    'focus-visible:shadow-focus-ring disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        primary: [
          'border-transparent bg-brand text-on-brand',
          'not-disabled:hover:bg-brand-hover not-disabled:active:bg-brand-pressed',
          'disabled:bg-disabled disabled:text-disabled',
        ],
        secondary: [
          'border-strong bg-surface text-primary',
          'not-disabled:hover:border-hover not-disabled:hover:bg-hover',
          'not-disabled:active:border-hover not-disabled:active:bg-pressed',
          'focus-visible:border-focus',
          'disabled:border-default disabled:bg-disabled disabled:text-disabled',
        ],
        ghost: [
          'border-transparent bg-transparent text-primary',
          'not-disabled:hover:bg-hover not-disabled:active:bg-pressed',
          'focus-visible:border-focus disabled:text-disabled',
        ],
        destructive: [
          'border-transparent bg-danger text-on-brand',
          'not-disabled:hover:bg-danger-hover not-disabled:active:bg-danger-pressed',
          'disabled:bg-disabled disabled:text-disabled',
        ],
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

const iconTone = {
  primary: 'text-icon-on-brand',
  destructive: 'text-icon-on-brand',
  secondary: 'text-icon-primary',
  ghost: 'text-icon-primary',
} as const;

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  /**
   * Keeps the button's width: the label turns transparent and a centred spinner appears.
   * The button stays focusable (aria-disabled) so focus is not lost while the request runs.
   */
  loading?: boolean;
  /** Render the child element (e.g. a router Link) with button styles. */
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  leadingIcon: Leading,
  trailingIcon: Trailing,
  loading = false,
  asChild = false,
  className,
  children,
  onClick,
  type,
  ...props
}: ButtonProps) {
  const v = variant ?? 'primary';
  const icon = cn('shrink-0', iconTone[v], 'group-disabled:text-icon-disabled');
  const Comp = asChild ? Slot.Root : 'button';

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <Comp
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ variant: v }), className)}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      data-loading={loading || undefined}
      onClick={handleClick}
      {...props}
    >
      {Leading && <Leading size={16} aria-hidden="true" className={cn(icon, loading && 'opacity-0')} />}
      <Slot.Slottable>{loading ? <span className="opacity-0">{children}</span> : children}</Slot.Slottable>
      {Trailing && <Trailing size={16} aria-hidden="true" className={cn(icon, loading && 'opacity-0')} />}
      {loading && (
        <Spinner
          tone={v === 'primary' || v === 'destructive' ? 'on-brand' : 'default'}
          className="absolute inset-0 m-auto"
        />
      )}
    </Comp>
  );
}
