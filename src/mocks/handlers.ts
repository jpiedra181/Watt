import { http, HttpResponse } from 'msw';
import {
  AlertStatus,
  AlertSeverity,
  HistoryRange,
  Settings,
  ZoneStatus,
  ZoneType,
  type Alert,
  type Hourly,
  type Overview,
} from '@/api/schemas';
import * as db from './db';
import { isEmpty, simulate } from './scenario';

const DEFAULT_PERIOD = '2026-09';

function periodParam(url: URL) {
  const p = url.searchParams.get('period') ?? DEFAULT_PERIOD;
  return db.isPeriod(p) ? p : DEFAULT_PERIOD;
}

const enumParam = <T extends string>(
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
  v: string | null,
) => {
  const r = schema.safeParse(v);
  return r.success ? r.data : undefined;
};

const notFound = (message: string) => HttpResponse.json({ message, code: 'NOT_FOUND' }, { status: 404 });

const emptyOverview = (o: Overview): Overview => ({
  ...o,
  kpis: {
    consumption: { value: 0, previous: 0, trend: [] },
    cost: { value: 0, previous: 0, trend: [] },
    peakDemand: { value: 0, previous: 0, trend: [] },
    perGuestNight: { value: 0, previous: 0, trend: [] },
  },
  byType: [],
  insight: '',
});

export const handlers = [
  http.get('/api/property', async () => (await simulate()) ?? HttpResponse.json(db.property())),

  http.get('/api/overview', async ({ request }) => {
    const fail = await simulate();
    if (fail) return fail;
    const o = db.overview(periodParam(new URL(request.url)));
    return HttpResponse.json(isEmpty() ? emptyOverview(o) : o);
  }),

  http.get('/api/consumption/hourly', async ({ request }) => {
    const fail = await simulate();
    if (fail) return fail;
    const url = new URL(request.url);
    const date = url.searchParams.get('date') ?? db.lastDayOf(periodParam(url));
    const h = db.hourly(date);
    if (!h) return notFound(`No readings for ${date}`);
    const out: Hourly = isEmpty() ? { ...h, points: h.points.map((p) => ({ ...p, kwh: null })) } : h;
    return HttpResponse.json(out);
  }),

  http.get('/api/zones', async ({ request }) => {
    const fail = await simulate();
    if (fail) return fail;
    const url = new URL(request.url);
    const page = db.zones({
      period: periodParam(url),
      q: url.searchParams.get('q') ?? undefined,
      status: enumParam(ZoneStatus, url.searchParams.get('status')),
      type: enumParam(ZoneType, url.searchParams.get('type')),
      trend: (['up', 'down'] as const).find((t) => t === url.searchParams.get('trend')),
      sort: url.searchParams.get('sort') ?? undefined,
      page: Math.max(1, Number(url.searchParams.get('page') ?? 1) || 1),
      size: Math.min(100, Math.max(1, Number(url.searchParams.get('size') ?? 10) || 10)),
    });
    return HttpResponse.json(isEmpty() ? { ...page, items: [], total: 0 } : page);
  }),

  http.get('/api/zone-types/:type', async ({ params, request }) => {
    const fail = await simulate();
    if (fail) return fail;
    const type = enumParam(ZoneType, String(params.type));
    if (!type) return notFound('Unknown zone');
    return HttpResponse.json(db.zoneType(type, periodParam(new URL(request.url))));
  }),

  http.get('/api/zone-types/:type/history', async ({ params, request }) => {
    const fail = await simulate();
    if (fail) return fail;
    const url = new URL(request.url);
    const type = enumParam(ZoneType, String(params.type));
    if (!type) return notFound('Unknown zone');
    const range = enumParam(HistoryRange, url.searchParams.get('range')) ?? '30d';
    const h = db.history(type, range, periodParam(url));
    return HttpResponse.json(
      isEmpty() ? { ...h, points: h.points.map((p) => ({ ...p, value: null, previous: null })) } : h,
    );
  }),

  http.get('/api/alerts', async ({ request }) => {
    const fail = await simulate();
    if (fail) return fail;
    const url = new URL(request.url);
    const page = db.alerts({
      period: periodParam(url),
      status: enumParam(AlertStatus, url.searchParams.get('status')),
      zone: enumParam(ZoneType, url.searchParams.get('zone')),
      severity: enumParam(AlertSeverity, url.searchParams.get('severity')),
      cursor: Number(url.searchParams.get('cursor') ?? 0) || 0,
      limit: Number(url.searchParams.get('limit') ?? 7) || 7,
    });
    if (isEmpty())
      return HttpResponse.json({
        items: [],
        nextCursor: null,
        counts: { all: 0, new: 0, reviewed: 0, resolved: 0 },
      });
    return HttpResponse.json(page);
  }),

  http.patch('/api/alerts/:id', async ({ params, request }) => {
    const fail = await simulate();
    if (fail) return fail;
    const body = (await request.json()) as { status?: Alert['status'] };
    const status = enumParam(AlertStatus, body.status ?? null);
    if (!status) return HttpResponse.json({ message: 'Invalid status' }, { status: 400 });
    const [changed] = db.setAlertStatus([String(params.id)], status);
    return changed ? HttpResponse.json(changed) : notFound('Alert not found');
  }),

  http.post('/api/alerts/resolve', async ({ request }) => {
    const fail = await simulate();
    if (fail) return fail;
    const body = (await request.json()) as { ids?: string[] };
    return HttpResponse.json(db.setAlertStatus(body.ids ?? [], 'resolved'));
  }),

  http.get('/api/recommendations', async ({ request }) => {
    const fail = await simulate();
    if (fail) return fail;
    if (isEmpty()) return HttpResponse.json([]);
    return HttpResponse.json(
      db.recommendations(enumParam(ZoneType, new URL(request.url).searchParams.get('type'))),
    );
  }),

  http.post('/api/recommendations/:id/:action', async ({ params }) => {
    const fail = await simulate();
    if (fail) return fail;
    const action = String(params.action);
    if (action !== 'apply' && action !== 'dismiss' && action !== 'undo') return notFound('Unknown action');
    const rec = db.updateRecommendation(String(params.id), action);
    return rec ? HttpResponse.json(rec) : notFound('Recommendation not found');
  }),

  http.get('/api/settings', async () => (await simulate()) ?? HttpResponse.json(db.settings())),

  http.put('/api/settings', async ({ request }) => {
    const fail = await simulate();
    if (fail) return fail;
    const parsed = Settings.safeParse(await request.json());
    if (!parsed.success)
      return HttpResponse.json({ message: 'Invalid settings', code: 'VALIDATION' }, { status: 422 });
    return HttpResponse.json(db.saveSettings(parsed.data));
  }),

  http.get('/api/search', async ({ request }) => {
    const fail = await simulate();
    if (fail) return fail;
    return HttpResponse.json(db.search(new URL(request.url).searchParams.get('q') ?? ''));
  }),
];
