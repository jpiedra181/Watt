import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { queries } from '@/api/queries';
import { DEFAULT_PERIOD } from './search';

/** The reporting month from the URL (`?period=2026-08`), defaulting to the latest one. */
export function usePeriod() {
  const { period } = useSearch({ strict: false }) as { period?: string };
  const property = useQuery(queries.property());
  const periods = property.data?.periods ?? [];
  const id = period && (!periods.length || periods.some((p) => p.id === period)) ? period : DEFAULT_PERIOD;
  const navigate = useNavigate();
  return {
    id,
    period: periods.find((p) => p.id === id),
    periods,
    setPeriod: (next: string) =>
      void navigate({
        to: '.',
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          period: next === DEFAULT_PERIOD ? undefined : next,
          page: undefined,
        }),
      }),
  };
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · Watt`;
  }, [title]);
}
