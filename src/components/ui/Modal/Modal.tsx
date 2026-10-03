import type { ComponentProps, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Dialog as D } from 'radix-ui';
import { cn } from '@/lib/cn';
import { IconButton } from '../IconButton/IconButton';

/**
 * Figma `Modal` (20:919) on Radix Dialog — role="dialog", aria-modal, focus trapped and restored
 * to the trigger, Esc and the close button dismiss. 480px, surface-raised, radius/xl, Elevation/3,
 * over bg/scrim. Types: Confirm and Form; Loading is the caller's button state.
 */
export const Modal = D.Root;
export const ModalTrigger = D.Trigger;
export const ModalClose = D.Close;

export interface ModalContentProps extends Omit<ComponentProps<typeof D.Content>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
  /** Buttons, right-aligned on the subtle footer. Put the primary action last. */
  footer?: ReactNode;
  /** Disable dismissal while a request is running. */
  dismissible?: boolean;
  /**
   * Where focus lands on open. `dialog` (default) focuses the dialog itself so the title and
   * description are read first; `first` focuses the first field, for forms.
   */
  initialFocus?: 'dialog' | 'first';
  children?: ReactNode;
}

export function ModalContent({
  title,
  description,
  footer,
  dismissible = true,
  initialFocus = 'dialog',
  className,
  children,
  ...props
}: ModalContentProps) {
  const block = (e: Event) => !dismissible && e.preventDefault();
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-scrim" />
      <D.Content
        {...(description ? {} : { 'aria-describedby': undefined })}
        tabIndex={-1}
        onEscapeKeyDown={block}
        onPointerDownOutside={block}
        onOpenAutoFocus={(e) => {
          if (initialFocus === 'first') {
            const field = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(
              'input, [role="combobox"], textarea',
            );
            if (field) {
              e.preventDefault();
              field.focus();
            }
            return;
          }
          e.preventDefault();
          (e.currentTarget as HTMLElement).focus();
        }}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[480px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 flex-col',
          'overflow-hidden rounded-xl border border-default bg-surface-raised shadow-elevation-3 outline-none',
          className,
        )}
        {...props}
      >
        <div className="flex items-start gap-12 pb-12 pl-24 pr-20 pt-20">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <D.Title className="type-heading-section text-primary">{title}</D.Title>
            {description && (
              <D.Description className="type-body-small text-secondary">{description}</D.Description>
            )}
          </div>
          <D.Close asChild>
            <IconButton variant="ghost" icon={X} label="Close" tooltip={false} disabled={!dismissible} />
          </D.Close>
        </div>
        <div className="flex min-h-0 flex-col gap-16 overflow-y-auto px-24 pb-20 pt-8">{children}</div>
        {footer && (
          <div className="flex flex-wrap items-center justify-end gap-8 border-t border-subtle bg-subtle px-24 py-16">
            {footer}
          </div>
        )}
      </D.Content>
    </D.Portal>
  );
}
