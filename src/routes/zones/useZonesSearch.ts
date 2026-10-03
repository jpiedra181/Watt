import { useCallback, useMemo } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import type { ZonesParams } from '@/api/queries';
import { usePeriod } from '@/app/usePeriod';
import type { ZonesSearch } from '@/app/search';

const route = getRouteApi('/zones');
export const DEFAULT_SORT = 'consumption.desc';
export const DEFAULT_SIZE = 10;

/**
 * The Zones table keeps all of its state in the URL: search, filters, sort, page, page size and
 * the selected rows. Defaults are left out so links stay short.
 */
export function useZonesSearch() {
  const search = route.useSearch();
  const navigate = route.useNavigate();
  const { id: period } = usePeriod();

  const selected = useMemo(
    () => new Set(search.selected?.split(',').filter(Boolean) ?? []),
    [search.selected],
  );

  const params: ZonesParams = {
    period,
    q: search.q,
    status: search.status,
    type: search.type,
    trend: search.trend,
    sort: search.sort ?? DEFAULT_SORT,
    page: search.page ?? 1,
    size: search.size ?? DEFAULT_SIZE,
  };

  /** Merge a patch into the URL. Filter changes go back to page 1; typing replaces history. */
  const update = useCallback(
    (patch: Partial<ZonesSearch>, { replace = false, keepPage = false } = {}) =>
      navigate({
        search: (prev) => {
          const next = { ...prev, ...patch };
          if (!keepPage && !('page' in patch)) next.page = undefined;
          if (next.sort === DEFAULT_SORT) next.sort = undefined;
          if (next.size === DEFAULT_SIZE) next.size = undefined;
          if (next.page === 1) next.page = undefined;
          if (next.q === '') next.q = undefined;
          if (next.selected === '') next.selected = undefined;
          return next;
        },
        replace,
        resetScroll: false,
      }),
    [navigate],
  );

  const setSelected = (ids: Set<string>) =>
    update({ selected: [...ids].join(',') || undefined }, { replace: true, keepPage: true });

  const hasFilters = Boolean(search.q || search.status || search.type || search.trend);

  return { search, params, selected, setSelected, update, hasFilters };
}
