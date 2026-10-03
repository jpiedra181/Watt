import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Bell, Gauge, Layers, Search } from 'lucide-react';
import { queries } from '@/api/queries';
import { cn } from '@/lib/cn';
import { fieldBox } from '../../ui/Field/Field';
import { menuItemClass, menuSurfaceClass } from '../../ui/Menu/menuItem';
import { Spinner } from '../../ui/Spinner/Spinner';

interface Option {
  id: string;
  group: 'Zones' | 'Meters' | 'Alerts';
  label: string;
  hint: string;
  go: () => void;
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const groupIcon = { Zones: Layers, Meters: Gauge, Alerts: Bell } as const;

/**
 * Topbar search — an ARIA 1.2 combobox: type to search zones, meters and alerts, ↑/↓ to move,
 * Enter to open, Esc to close. Press "/" anywhere to focus it.
 */
export function GlobalSearch({
  placeholder = 'Search zones, meters, alerts…',
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const term = useDebounced(q.trim(), 180);
  const { data, isFetching, isError } = useQuery(queries.search(term));

  const options = useMemo<Option[]>(() => {
    if (!data || !term) return [];
    const close = () => {
      setOpen(false);
      setQ('');
    };
    return [
      ...data.zones.map((z) => ({
        id: `z-${z.id}`,
        group: 'Zones' as const,
        label: z.name,
        hint: z.detail,
        go: () => {
          close();
          void navigate({ to: '/zones/$type', params: { type: z.type } });
        },
      })),
      ...data.meters.map((m) => ({
        id: `m-${m.id}`,
        group: 'Meters' as const,
        label: m.code,
        hint: m.name,
        go: () => {
          close();
          void navigate({ to: '/zones/$type', params: { type: m.type } });
        },
      })),
      ...data.alerts.map((a) => ({
        id: `a-${a.id}`,
        group: 'Alerts' as const,
        label: a.title,
        hint: a.meta,
        go: () => {
          close();
          void navigate({ to: '/alerts', search: { status: a.status } });
        },
      })),
    ];
  }, [data, term, navigate]);

  // "/" focuses the search unless the user is typing somewhere else.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (
        e.key === '/' &&
        !e.metaKey &&
        !e.ctrlKey &&
        !t.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const expanded = open && term.length > 0;
  const groups = (['Zones', 'Meters', 'Alerts'] as const)
    .map((g) => ({ g, items: options.filter((o) => o.group === g) }))
    .filter((x) => x.items.length);
  const status = !term
    ? ''
    : isError
      ? 'Search is unavailable right now.'
      : isFetching && !data
        ? 'Searching…'
        : `${options.length} result${options.length === 1 ? '' : 's'}.`;

  return (
    <div className={cn('relative', className)}>
      <div className={fieldBox}>
        <Search size={16} aria-hidden="true" className="shrink-0 text-icon-secondary" />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search zones, meters and alerts"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && options[active] ? `${id}-${options[active].id}` : undefined}
          placeholder={placeholder}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
              setActive((a) => Math.min(options.length - 1, a + 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            } else if (e.key === 'Enter' && expanded && options[active]) {
              e.preventDefault();
              options[active].go();
            } else if (e.key === 'Escape') {
              if (expanded) setOpen(false);
              else setQ('');
            }
          }}
          className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-tertiary [&::-webkit-search-cancel-button]:hidden"
        />
        {isFetching && term ? <Spinner /> : null}
      </div>
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
      <div
        id={listId}
        role="listbox"
        aria-label="Search results"
        hidden={!expanded}
        className={cn(
          menuSurfaceClass,
          'absolute left-0 right-0 top-full mt-4 max-h-[min(420px,70dvh)] overflow-y-auto',
        )}
      >
        {expanded && options.length === 0 && !isFetching && (
          <p className="px-8 py-10 type-body-small text-secondary">
            No zones, meters or alerts match “{term}”.
          </p>
        )}
        {groups.map(({ g, items }) => {
          const Icon = groupIcon[g];
          return (
            <div key={g} role="group" aria-labelledby={`${id}-${g}`}>
              <p id={`${id}-${g}`} className="px-8 pb-2 pt-6 type-label-overline text-tertiary">
                {g}
              </p>
              {items.map((o) => {
                const index = options.indexOf(o);
                return (
                  // Options are never focused: the input keeps focus and points at them with aria-activedescendant.
                  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus
                  <div
                    key={o.id}
                    id={`${id}-${o.id}`}
                    role="option"
                    aria-selected={index === active}
                    data-highlighted={index === active ? '' : undefined}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={o.go}
                    className={cn('group/opt', menuItemClass, 'h-auto min-h-36 py-6')}
                  >
                    <Icon size={16} aria-hidden="true" className="shrink-0 text-icon-secondary" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate type-body-small-strong text-primary">{o.label}</span>
                      <span className="truncate type-caption text-tertiary group-data-[highlighted]/opt:text-secondary">
                        {o.hint}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
