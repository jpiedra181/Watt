import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { Toast as T } from 'radix-ui';
import { cn } from '@/lib/cn';

export type ToastTone = 'success' | 'warning' | 'error' | 'info';

export interface ToastOptions {
  tone: ToastTone;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    /** Describes the action for screen readers when the toast is announced. */ altText?: string;
  };
  /** ms; errors stay until dismissed. */
  duration?: number;
}

const toneIcon = {
  success: { Icon: CircleCheck, className: 'text-good' },
  warning: { Icon: TriangleAlert, className: 'text-warning' },
  error: { Icon: CircleAlert, className: 'text-critical' },
  info: { Icon: Info, className: 'text-icon-brand' },
} as const;

interface ToastCardProps extends ToastOptions {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Figma `Toast` (13:454) — 360px, surface-raised, Elevation/2, radius/lg.
 * Success/Info are polite (role="status"); Warning/Error are assertive (role="alert").
 */
export function ToastCard({
  tone,
  title,
  description,
  action,
  duration,
  open,
  onOpenChange,
}: ToastCardProps) {
  const { Icon, className } = toneIcon[tone];
  const urgent = tone === 'warning' || tone === 'error';
  return (
    <T.Root
      type={urgent ? 'foreground' : 'background'}
      duration={duration ?? (tone === 'error' ? Infinity : 6000)}
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        'pointer-events-auto flex w-[360px] max-w-full items-start gap-12 rounded-lg border border-default bg-surface-raised',
        'py-12 pl-16 pr-12 shadow-elevation-2',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]',
      )}
    >
      <Icon size={20} aria-hidden="true" className={cn('shrink-0', className)} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <T.Title className="type-body-small-strong text-primary">{title}</T.Title>
        {description && <T.Description className="type-caption text-secondary">{description}</T.Description>}
        {action && (
          <T.Action altText={action.altText ?? action.label} asChild>
            <button
              type="button"
              onClick={action.onClick}
              className="self-start rounded-xs type-caption-strong text-brand outline-none hover:underline focus-visible:shadow-focus-ring"
            >
              {action.label}
            </button>
          </T.Action>
        )}
      </div>
      <T.Close
        aria-label="Dismiss notification"
        className="-m-4 flex size-24 shrink-0 cursor-pointer items-center justify-center rounded-sm text-icon-secondary outline-none hover:bg-hover hover:text-icon-primary focus-visible:shadow-focus-ring"
      >
        <X size={16} aria-hidden="true" />
      </T.Close>
    </T.Root>
  );
}

export function ToastViewport({ className }: { className?: string }) {
  return (
    <T.Viewport
      className={cn(
        'fixed bottom-0 right-0 z-[60] m-0 flex w-full max-w-[100vw] list-none flex-col items-end gap-8 p-16 outline-none sm:w-auto sm:p-24',
        className,
      )}
    />
  );
}

type Toaster = (options: ToastOptions) => void;
const ToastContext = createContext<Toaster | null>(null);

/** Holds the toast queue. `useToast()` returns `toast({ tone, title, … })`. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<(ToastOptions & { id: number; open: boolean })[]>([]);

  const toast = useCallback<Toaster>((options) => {
    setToasts((list) => [...list.slice(-2), { ...options, id: Date.now() + Math.random(), open: true }]);
  }, []);

  const value = useMemo(() => toast, [toast]);

  return (
    <ToastContext value={value}>
      <T.Provider swipeDirection="right" label="Notifications">
        {children}
        {toasts.map(({ id, open, ...t }) => (
          <ToastCard
            key={id}
            {...t}
            open={open}
            onOpenChange={(o) => {
              if (!o) {
                setToasts((list) => list.map((x) => (x.id === id ? { ...x, open: false } : x)));
                window.setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 300);
              }
            }}
          />
        ))}
        <ToastViewport />
      </T.Provider>
    </ToastContext>
  );
}

export function useToast() {
  const toast = use(ToastContext);
  if (!toast) throw new Error('useToast must be used inside <ToastProvider>');
  return toast;
}
