import type { ButtonHTMLAttributes, MouseEvent, Ref } from 'react';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Spinner } from '../Spinner/Spinner';
import { Tooltip } from '../Tooltip/Tooltip';

export const iconButtonVariants = cva(
  [
    'group relative inline-flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-md border outline-none',
    'transition-[background-color,border-color,box-shadow,color] duration-100',
    'focus-visible:border-focus focus-visible:shadow-focus-ring disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        secondary: [
          'border-strong bg-surface text-icon-primary',
          'not-disabled:hover:border-hover not-disabled:hover:bg-hover',
          'not-disabled:active:border-hover not-disabled:active:bg-pressed',
          'disabled:border-default disabled:bg-disabled disabled:text-icon-disabled',
        ],
        ghost: [
          'border-transparent bg-transparent text-icon-secondary',
          'not-disabled:hover:bg-hover not-disabled:hover:text-icon-primary',
          'not-disabled:active:bg-pressed not-disabled:active:text-icon-primary',
          'focus-visible:text-icon-primary disabled:text-icon-disabled',
        ],
      },
    },
    defaultVariants: { variant: 'secondary' },
  },
);

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon;
  /** Accessible name — required, it is also the tooltip text. */
  label: string;
  variant?: 'secondary' | 'ghost';
  loading?: boolean;
  /** Figma asks for a Tooltip on every icon-only button. Pass `false` only when a visible label is adjacent. */
  tooltip?: boolean;
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right';
  ref?: Ref<HTMLButtonElement>;
}

/** Figma `Icon Button` (9:303) — 36×36, icon 16. */
export function IconButton({
  icon: Icon,
  label,
  variant = 'secondary',
  loading = false,
  tooltip = true,
  tooltipSide = 'top',
  className,
  onClick,
  type = 'button',
  ...props
}: IconButtonProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={cn(iconButtonVariants({ variant }), className)}
      onClick={(e: MouseEvent<HTMLButtonElement>) => (loading ? e.preventDefault() : onClick?.(e))}
      {...props}
    >
      {loading ? <Spinner /> : <Icon size={16} aria-hidden="true" />}
    </button>
  );
  if (!tooltip || props.disabled) return button;
  return (
    <Tooltip content={label} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
