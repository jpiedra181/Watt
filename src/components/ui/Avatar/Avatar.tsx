import { cn } from '@/lib/cn';

export interface AvatarProps {
  initials: string;
  /** Small = 24px · Medium = 32px. */
  size?: 'sm' | 'md';
  /** Full name, announced instead of the initials. Omit when the avatar sits next to the visible name. */
  name?: string;
  className?: string;
}

/** Initials avatar — Figma `Avatar` (7:56). */
export function Avatar({ initials, size = 'md', name, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand',
        size === 'md' ? 'size-32 type-body-small-strong' : 'size-24 type-caption-strong',
        className,
      )}
      {...(name ? { role: 'img', 'aria-label': name } : { 'aria-hidden': true })}
    >
      {initials}
    </span>
  );
}
