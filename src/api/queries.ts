import {
  infiniteQueryOptions,
  keepPreviousData,
  queryOptions,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import { z } from 'zod';
import { qs, request } from './client';
import {
  Alert,
  AlertsPage,
  History,
  Hourly,
  Overview,
  Property,
  Recommendation,
  SearchResults,
  Settings,
  ZonesPage,
  ZoneTypeDetail,
  type AlertSeverity,
  type AlertStatus,
  type HistoryRange,
  type ZoneStatus,
  type ZoneType,
} from './schemas';

/* ── Query keys & options ─────────────────────────────────────────────────────────────── */
export interface ZonesParams {
  period: string;
  q?: string;
  status?: ZoneStatus;
  type?: ZoneType;
  trend?: 'up' | 'down';
  sort: string;
  page: number;
  size: number;
}
export interface AlertsParams {
  period: string;
  status?: AlertStatus;
  zone?: ZoneType;
  severity?: AlertSeverity;
}

export const queries = {
  property: () =>
    queryOptions({
      queryKey: ['property'],
      queryFn: ({ signal }) => request('/api/property', Property, { signal }),
      staleTime: 5 * 60_000,
    }),
  overview: (period: string) =>
    queryOptions({
      queryKey: ['overview', period],
      queryFn: ({ signal }) => request(`/api/overview${qs({ period })}`, Overview, { signal }),
    }),
  hourly: (period: string) =>
    queryOptions({
      queryKey: ['hourly', period],
      queryFn: ({ signal }) => request(`/api/consumption/hourly${qs({ period })}`, Hourly, { signal }),
    }),
  zones: (params: ZonesParams) =>
    queryOptions({
      queryKey: ['zones', params],
      queryFn: ({ signal }) => request(`/api/zones${qs({ ...params })}`, ZonesPage, { signal }),
      placeholderData: keepPreviousData,
    }),
  zoneType: (type: ZoneType, period: string) =>
    queryOptions({
      queryKey: ['zone-type', type, period],
      queryFn: ({ signal }) =>
        request(`/api/zone-types/${type}${qs({ period })}`, ZoneTypeDetail, { signal }),
    }),
  history: (type: ZoneType, range: HistoryRange, period: string) =>
    queryOptions({
      queryKey: ['history', type, range, period],
      queryFn: ({ signal }) =>
        request(`/api/zone-types/${type}/history${qs({ range, period })}`, History, { signal }),
      placeholderData: keepPreviousData,
    }),
  alerts: (params: AlertsParams) =>
    infiniteQueryOptions({
      queryKey: ['alerts', params],
      initialPageParam: 0,
      queryFn: ({ signal, pageParam }) =>
        request(
          `/api/alerts${qs({ ...params, cursor: pageParam, limit: pageParam === 0 ? 7 : 10 })}`,
          AlertsPage,
          { signal },
        ),
      getNextPageParam: (last) => (last.nextCursor ? Number(last.nextCursor) : undefined),
    }),
  recommendations: (type?: ZoneType) =>
    queryOptions({
      queryKey: ['recommendations', type ?? 'all'],
      queryFn: ({ signal }) =>
        request(`/api/recommendations${qs({ type })}`, z.array(Recommendation), { signal }),
    }),
  settings: () =>
    queryOptions({
      queryKey: ['settings'],
      queryFn: ({ signal }) => request('/api/settings', Settings, { signal }),
      staleTime: Infinity,
    }),
  search: (q: string) =>
    queryOptions({
      queryKey: ['search', q],
      queryFn: ({ signal }) => request(`/api/search${qs({ q })}`, SearchResults, { signal }),
      enabled: q.trim().length > 0,
      placeholderData: keepPreviousData,
      staleTime: 30_000,
    }),
};

/* ── Mutations ────────────────────────────────────────────────────────────────────────── */
type AlertPages = InfiniteData<AlertsPage, number>;

/** Applies a status change to every cached alerts list (optimistic UI) and returns a rollback. */
function patchAlertCaches(qc: ReturnType<typeof useQueryClient>, ids: string[], status: AlertStatus) {
  const snapshot = qc.getQueriesData<AlertPages>({ queryKey: ['alerts'] });
  qc.setQueriesData<AlertPages>({ queryKey: ['alerts'] }, (data) =>
    data
      ? {
          ...data,
          pages: data.pages.map((p) => ({
            ...p,
            items: p.items.map((a) => (ids.includes(a.id) ? { ...a, status } : a)),
          })),
        }
      : data,
  );
  return () => snapshot.forEach(([key, value]) => qc.setQueryData(key, value));
}

export function useAlertStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: AlertStatus }) =>
      request(`/api/alerts/${id}`, Alert, { method: 'PATCH', json: { status } }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['alerts'] });
      return { rollback: patchAlertCaches(qc, [id], status) };
    },
    onError: (_e, _v, ctx) => ctx?.rollback(),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['alerts'] });
      void qc.invalidateQueries({ queryKey: ['property'] });
    },
  });
}

export function useResolveAlertsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      request('/api/alerts/resolve', z.array(Alert), { method: 'POST', json: { ids } }),
    onSuccess: (_d, ids) => {
      patchAlertCaches(qc, ids, 'resolved');
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['alerts'] });
      void qc.invalidateQueries({ queryKey: ['property'] });
    },
  });
}

export type RecommendationAction = 'apply' | 'dismiss' | 'undo';

export function useRecommendationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: RecommendationAction }) =>
      request(`/api/recommendations/${id}/${action}`, Recommendation, { method: 'POST' }),
    onMutate: async ({ id, action }) => {
      await qc.cancelQueries({ queryKey: ['recommendations'] });
      const snapshot = qc.getQueriesData<Recommendation[]>({ queryKey: ['recommendations'] });
      qc.setQueriesData<Recommendation[]>({ queryKey: ['recommendations'] }, (list) =>
        list
          ?.map((r) =>
            r.id !== id
              ? r
              : {
                  ...r,
                  status: (action === 'apply'
                    ? 'applied'
                    : action === 'dismiss'
                      ? 'dismissed'
                      : 'open') as Recommendation['status'],
                  appliedAt: action === 'apply' ? new Date().toISOString().slice(0, 16) : null,
                },
          )
          .filter((r) => r.status !== 'dismissed'),
      );
      return { rollback: () => snapshot.forEach(([key, value]) => qc.setQueryData(key, value)) };
    },
    onError: (_e, _v, ctx) => ctx?.rollback(),
    onSettled: () => void qc.invalidateQueries({ queryKey: ['recommendations'] }),
  });
}

export function useSaveSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: Settings) => request('/api/settings', Settings, { method: 'PUT', json: s }),
    onSuccess: (saved) => {
      qc.setQueryData(queries.settings().queryKey, saved);
      void qc.invalidateQueries({ queryKey: ['property'] });
      void qc.invalidateQueries({ queryKey: ['hourly'] });
    },
  });
}

export type { HistoryRange };
