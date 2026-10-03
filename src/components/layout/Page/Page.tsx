import { useId, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Content column: Figma padding 32 / 24 / 16 and gap 24 / 20 / 16 (desktop / tablet / mobile). */
export function Page({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-16 p-16 md:gap-20 md:p-24 xl:gap-24 xl:p-32', className)}>
      {children}
    </div>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Short subtitle below 1280px (Figma tablet/mobile: "Tue 30 Sep · updated 2 min ago"). */
  shortSubtitle?: ReactNode;
  /** Status badge next to the title. */
  badge?: ReactNode;
  /** Zone tile before the title. */
  leading?: ReactNode;
  /** Breadcrumb above the title row. */
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}

/**
 * Page title (Heading/Page) + subtitle (Body/Small, text/tertiary) + actions.
 * The <h1> receives focus after client-side navigation so screen readers announce the new page.
 */
export function PageHeader({
  title,
  subtitle,
  shortSubtitle,
  badge,
  leading,
  breadcrumb,
  actions,
}: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-12">
      {breadcrumb}
      <div className="flex flex-wrap items-center gap-x-16 gap-y-12">
        {leading}
        <div className="flex min-w-0 flex-1 basis-[240px] flex-col gap-2 sm:gap-4">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <h1 tabIndex={-1} data-page-title className="type-heading-page text-primary outline-none">
              {title}
            </h1>
            {badge}
          </div>
          {/* text/tertiary is 4.4:1 on bg/canvas — below AA for small text — so canvas copy uses text/secondary. */}
          {subtitle && (
            <p className={cn('type-body-small text-secondary', shortSubtitle && 'max-xl:hidden')}>
              {subtitle}
            </p>
          )}
          {shortSubtitle && (
            <p className="type-caption text-secondary sm:type-body-small xl:hidden">{shortSubtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-8">{actions}</div>}
      </div>
    </header>
  );
}

export interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Header slot on the right (ghost button, icon button, range selector). */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** For cards whose content runs edge to edge (tables, lists). */
  flush?: boolean;
  as?: 'section' | 'div';
}

/** Figma card: surface, border/default, radius/lg, 20px padding (16 on phones), 16px gap. */
export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  flush,
  as: As = 'section',
}: CardProps) {
  const id = useId();
  return (
    <As
      aria-labelledby={title ? id : undefined}
      className={cn(
        'flex min-w-0 flex-col rounded-lg border border-default bg-surface',
        flush ? 'overflow-hidden' : 'gap-16 p-16 md:p-20',
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex min-h-36 items-center gap-12">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {title && (
              <h2 id={id} className="type-heading-section text-primary">
                {title}
              </h2>
            )}
            {subtitle && <p className="type-caption text-tertiary">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </As>
  );
}
