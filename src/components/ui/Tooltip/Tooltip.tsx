import type { ReactNode } from 'react';
import { Tooltip as T } from 'radix-ui';
import { cn } from '@/lib/cn';

export interface TooltipProps {
  content: ReactNode;
  /** The trigger. Must be focusable (button, link…) so keyboard users get the tooltip too. */
  children: ReactNode;
  /** Figma `Placement`. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Controlled open state — only for docs and tests. */
  open?: boolean;
  className?: string;
}

/**
 * Figma `Tooltip` (13:367). Radix handles hover + focus, Esc to dismiss and keeps the bubble
 * open while hovered (WCAG 1.4.13 Content on Hover or Focus).
 */
export function Tooltip({ content, children, side = 'top', open, className }: TooltipProps) {
  return (
    <T.Root open={open}>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          side={side}
          sideOffset={4}
          collisionPadding={8}
          className={cn(
            'z-50 max-w-[280px] rounded-sm bg-inverse px-8 py-6 type-caption text-inverse',
            className,
          )}
        >
          {content}
          <T.Arrow width={10} height={5} className="fill-[var(--color-bg-inverse)]" />
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}

export const TooltipProvider = T.Provider;
